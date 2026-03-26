/**
 * user-settings — GET/POST risk preferences keyed by wallet address.
 *
 * GET  ?wallet=0x…  → returns settings row (or defaults)
 * POST { wallet, auto_protect_enabled?, … } → upserts and returns updated row
 *
 * Refactored to use shared modules.
 */
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { optionsResponse, jsonResponse, errorResponse, buildContext, parseJsonBody, ValidationError } from "../_shared/http.ts";
import { validateAddress, validateSettingsPayload } from "../_shared/validate.ts";
import { logRequest, logResponse, logError } from "../_shared/logger.ts";
import { EDGE_CONFIG } from "../_shared/config.ts";

const DEFAULTS = {
  auto_protect_enabled: true,
  risk_threshold: 60,
  auto_adjust_slippage: true,
  notify_on_high_risk: true,
};

function db() {
  return createClient(EDGE_CONFIG.SUPABASE_URL, EDGE_CONFIG.SUPABASE_SERVICE_ROLE_KEY);
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return optionsResponse();

  const ctx = buildContext(req);
  logRequest(ctx);

  try {
    // ── GET ────────────────────────────────────────────────────────────────
    if (req.method === "GET") {
      const url = new URL(req.url);
      const wallet = validateAddress(url.searchParams.get("wallet"));

      const { data, error } = await db()
        .from("user_settings")
        .select("*")
        .eq("wallet_address", wallet)
        .maybeSingle();

      if (error) {
        logError(ctx, error);
        return errorResponse("UPSTREAM_ERROR", "Database error", 500, ctx);
      }

      logResponse(ctx, 200);
      return jsonResponse(200, data ?? { wallet_address: wallet, ...DEFAULTS }, { "X-Request-Id": ctx.requestId });
    }

    // ── POST (upsert) ──────────────────────────────────────────────────────
    if (req.method === "POST") {
      const body = await parseJsonBody(req);
      const settings = validateSettingsPayload(body);

      const { wallet, ...updates } = settings;
      const { data, error } = await db()
        .from("user_settings")
        .upsert({ wallet_address: wallet, ...updates }, { onConflict: "wallet_address" })
        .select("*")
        .single();

      if (error) {
        logError(ctx, error);
        return errorResponse("UPSTREAM_ERROR", "Database error", 500, ctx);
      }

      logResponse(ctx, 200);
      return jsonResponse(200, data, { "X-Request-Id": ctx.requestId });
    }

    return errorResponse("METHOD_NOT_ALLOWED", "Method not allowed", 405, ctx);
  } catch (err) {
    logError(ctx, err);
    if (err instanceof ValidationError) {
      return errorResponse("VALIDATION_ERROR", err.message, 400, ctx);
    }
    return errorResponse("INTERNAL_ERROR", "Internal server error", 500, ctx);
  }
});
