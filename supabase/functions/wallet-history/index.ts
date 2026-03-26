/**
 * wallet-history — Paginated risk assessment history for a wallet.
 *
 * GET ?wallet=0x…&limit=20&offset=0&order=desc
 *   → { wallet, total, limit, offset, data, stats, fetched_at }
 *
 * Refactored to use shared modules.
 */
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { optionsResponse, jsonResponse, errorResponse, buildContext, ValidationError } from "../_shared/http.ts";
import { validateAddress, validatePagination } from "../_shared/validate.ts";
import { logRequest, logResponse, logError } from "../_shared/logger.ts";
import { EDGE_CONFIG } from "../_shared/config.ts";

function db() {
  return createClient(EDGE_CONFIG.SUPABASE_URL, EDGE_CONFIG.SUPABASE_SERVICE_ROLE_KEY);
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return optionsResponse();

  const ctx = buildContext(req);
  logRequest(ctx);

  if (req.method !== "GET") return errorResponse("METHOD_NOT_ALLOWED", "Method not allowed", 405, ctx);

  try {
    const url = new URL(req.url);
    const wallet = validateAddress(url.searchParams.get("wallet"));
    const { limit, offset, ascending } = validatePagination(url.searchParams);

    const supabase = db();

    const [pageResult, countResult] = await Promise.all([
      supabase
        .from("risk_assessments")
        .select("id, token_in, token_out, amount_in, safety_score, sandwich_risk, liquidity_health, wallet_risk, explanation, recommendation, created_at")
        .eq("user_address", wallet)
        .order("created_at", { ascending })
        .range(offset, offset + limit - 1),
      supabase
        .from("risk_assessments")
        .select("id", { count: "exact", head: true })
        .eq("user_address", wallet),
    ]);

    if (pageResult.error) {
      logError(ctx, pageResult.error);
      return errorResponse("UPSTREAM_ERROR", "Database error", 500, ctx);
    }

    // Stats aggregation on first page
    let stats = null;
    if (offset === 0) {
      const { data: allScores } = await supabase
        .from("risk_assessments")
        .select("safety_score, sandwich_risk, liquidity_health, wallet_risk")
        .eq("user_address", wallet)
        .limit(500);

      if (allScores && allScores.length > 0) {
        const avg = (arr: number[]) => Math.round(arr.reduce((s, v) => s + v, 0) / arr.length);
        stats = {
          avg_safety_score: avg(allScores.map((r) => r.safety_score)),
          avg_sandwich_risk: avg(allScores.map((r) => r.sandwich_risk)),
          avg_liquidity_health: avg(allScores.map((r) => r.liquidity_health)),
          avg_wallet_risk: avg(allScores.map((r) => r.wallet_risk)),
          safe_count: allScores.filter((r) => r.safety_score >= 70).length,
          moderate_count: allScores.filter((r) => r.safety_score >= 40 && r.safety_score < 70).length,
          danger_count: allScores.filter((r) => r.safety_score < 40).length,
        };
      }
    }

    logResponse(ctx, 200, { total: countResult.count });
    return jsonResponse(200, {
      wallet,
      total: countResult.count ?? 0,
      limit,
      offset,
      data: pageResult.data ?? [],
      stats,
      fetched_at: new Date().toISOString(),
    }, {
      "X-Request-Id": ctx.requestId,
      "Cache-Control": "public, max-age=30",
    });
  } catch (err) {
    logError(ctx, err);
    if (err instanceof ValidationError) {
      return errorResponse("VALIDATION_ERROR", err.message, 400, ctx);
    }
    return errorResponse("INTERNAL_ERROR", "Internal server error", 500, ctx);
  }
});
