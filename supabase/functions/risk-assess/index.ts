/**
 * risk-assess — Main entrypoint for computing Safety Score.
 *
 * POST { pair, amount, wallet, user_address } → RiskResponse
 * GET  → version/status info
 *
 * Uses shared modules for validation, risk computation, and AI explanation.
 */
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { optionsResponse, jsonResponse, errorResponse, buildContext, parseJsonBody, ValidationError } from "../_shared/http.ts";
import { validateSwapRequest } from "../_shared/validate.ts";
import { computeFullRisk } from "../_shared/riskEngineMock.ts";
import { getExplanation } from "../_shared/riskExplanation.ts";
import { checkRateLimit } from "../_shared/rateLimit.ts";
import { logRequest, logResponse, logError } from "../_shared/logger.ts";
import { EDGE_CONFIG } from "../_shared/config.ts";

// ─── DB logging (fire and forget) ────────────────────────────────────────────

function logToDatabase(
  data: { pair: string; amount: number; user_address: string },
  scores: ReturnType<typeof computeFullRisk>,
  result: { explanation: string; recommendation: string },
): void {
  try {
    const supabase = createClient(EDGE_CONFIG.SUPABASE_URL, EDGE_CONFIG.SUPABASE_SERVICE_ROLE_KEY);
    supabase.from("risk_assessments").insert({
      user_address: data.user_address,
      token_in: data.pair.split("_")[0] ?? data.pair,
      token_out: data.pair.split("_")[1] ?? "USDC",
      amount_in: data.amount,
      safety_score: scores.safetyScore,
      sandwich_risk: scores.sandwich.score,
      liquidity_health: scores.liquidity.score,
      wallet_risk: scores.walletR.score,
      explanation: result.explanation,
      recommendation: result.recommendation,
    }).then(({ error }) => {
      if (error) console.error("DB log error:", error.message);
    });
  } catch (err) {
    console.error("DB log setup error:", err);
  }
}

// ─── Handler ─────────────────────────────────────────────────────────────────

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return optionsResponse();

  const ctx = buildContext(req);
  logRequest(ctx);

  // GET → health/version
  if (req.method === "GET") {
    const resp = jsonResponse(200, {
      status: "ok",
      version: EDGE_CONFIG.VERSION,
      service: "Risk Oracle API",
      ai: "Lovable AI Gateway (Gemini 2.5 Flash)",
    }, { "X-Request-Id": ctx.requestId });
    logResponse(ctx, 200);
    return resp;
  }

  if (req.method !== "POST") {
    return errorResponse("METHOD_NOT_ALLOWED", "Method not allowed", 405, ctx);
  }

  try {
    // 1. Parse & validate
    const body = await parseJsonBody(req);
    const swap = validateSwapRequest(body);

    // 2. Rate limit
    const rl = checkRateLimit(swap.userAddress);
    if (!rl.allowed) {
      return errorResponse("RATE_LIMITED", "Too many requests", 429, ctx);
    }

    // 3. Compute risk scores
    const scores = computeFullRisk(swap.pair!, swap.amountIn, swap.wallet ?? "normal");

    // 4. Generate explanation (AI with fallback)
    const { explanation, recommendation, aiSource } = await getExplanation(
      swap.pair!, swap.amountIn, swap.wallet ?? "normal", scores,
    );

    const result = {
      safety_score: scores.safetyScore,
      risk_breakdown: {
        sandwich_risk: scores.sandwich.score,
        liquidity_health: scores.liquidity.score,
        wallet_risk: scores.walletR.score,
      },
      explanation,
      recommendation,
      recommendation_type: scores.tier,
      _meta: { ai_source: aiSource, version: EDGE_CONFIG.VERSION, requestId: ctx.requestId },
    };

    // 5. Log to DB (non-blocking)
    logToDatabase(
      { pair: swap.pair!, amount: swap.amountIn, user_address: swap.userAddress },
      scores,
      { explanation, recommendation },
    );

    logResponse(ctx, 200, { safetyScore: scores.safetyScore, tier: scores.tier });
    return jsonResponse(200, result, {
      "X-Request-Id": ctx.requestId,
      "Cache-Control": "no-store",
    });
  } catch (err) {
    logError(ctx, err);
    if (err instanceof ValidationError) {
      return errorResponse("VALIDATION_ERROR", err.message, 400, ctx);
    }
    return errorResponse("INTERNAL_ERROR", "Internal server error", 500, ctx);
  }
});
