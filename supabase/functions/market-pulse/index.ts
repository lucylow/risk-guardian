/**
 * market-pulse — Real-time risk snapshot for major OneDEX pairs.
 *
 * GET /           → all pairs
 * GET /?pair=X    → single pair
 *
 * Refactored to use shared modules for risk computation.
 */
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { optionsResponse, jsonResponse, errorResponse, buildContext } from "../_shared/http.ts";
import { computeSandwichRisk, computeLiquidityHealth, getPoolHealth } from "../_shared/riskEngineMock.ts";
import { logRequest, logResponse } from "../_shared/logger.ts";
import { EDGE_CONFIG } from "../_shared/config.ts";

const PAIRS = [
  { pair: "ONE_USDC",       token_in: "ONE",  token_out: "USDC", label: "ONE / USDC" },
  { pair: "ONE_BTC",        token_in: "ONE",  token_out: "BTC",  label: "ONE / BTC"  },
  { pair: "ONE_ETH",        token_in: "ONE",  token_out: "ETH",  label: "ONE / ETH"  },
  { pair: "USDC_ONE",       token_in: "USDC", token_out: "ONE",  label: "USDC / ONE" },
  { pair: "HIGH_RISK_PAIR", token_in: "SHIT", token_out: "USDC", label: "⚠ SHIT / USDC" },
];

function computePairSnapshot(pairId: string, token_in: string, token_out: string, label: string) {
  const AMOUNT = 1000;
  const pool = getPoolHealth(pairId);
  const sandwich = computeSandwichRisk(pairId, AMOUNT);
  const health = computeLiquidityHealth(pairId, AMOUNT);
  const walletRisk = 12;
  const liquidityRisk = 100 - health;

  const totalRisk = 0.5 * sandwich + 0.3 * liquidityRisk + 0.2 * walletRisk;
  const safetyScore = Math.max(0, Math.min(100, Math.round(100 - totalRisk)));
  const tier = safetyScore >= 70 ? "safe" : safetyScore >= 40 ? "moderate" : "danger";

  const seed = pairId.split("").reduce((a, c) => a + c.charCodeAt(0), 0);
  const change = ((seed % 17) - 8) * 0.1;

  return {
    pair: pairId, token_in, token_out, label,
    safety_score: safetyScore, tier,
    sandwich_risk: sandwich, liquidity_health: health, wallet_risk: walletRisk,
    pool_tvl_usd: pool.liquidity_usd, volume_24h_usd: pool.volume_24h,
    lp_concentration: pool.lp_concentration,
    price_change_24h: Number(change.toFixed(2)),
    timestamp: new Date().toISOString(),
  };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return optionsResponse();

  const ctx = buildContext(req);
  logRequest(ctx);

  if (req.method !== "GET") return errorResponse("METHOD_NOT_ALLOWED", "Method not allowed", 405, ctx);

  const url = new URL(req.url);
  const pairFilter = url.searchParams.get("pair")?.toUpperCase();

  // Optional: enrich with recent DB scores
  let dbScores: Record<string, number> = {};
  try {
    const supabase = createClient(EDGE_CONFIG.SUPABASE_URL, EDGE_CONFIG.SUPABASE_SERVICE_ROLE_KEY);
    const since = new Date(Date.now() - 5 * 60 * 1000).toISOString();
    const { data } = await supabase
      .from("risk_assessments")
      .select("token_in, token_out, safety_score")
      .gte("created_at", since)
      .order("created_at", { ascending: false })
      .limit(100);

    if (data) {
      const buckets: Record<string, number[]> = {};
      for (const row of data) {
        const key = `${row.token_in}_${row.token_out}`.toUpperCase();
        if (!buckets[key]) buckets[key] = [];
        buckets[key].push(row.safety_score);
      }
      for (const [key, vals] of Object.entries(buckets)) {
        dbScores[key] = Math.round(vals.reduce((s, v) => s + v, 0) / vals.length);
      }
    }
  } catch { /* best-effort */ }

  const targets = pairFilter ? PAIRS.filter((p) => p.pair === pairFilter) : PAIRS;
  if (targets.length === 0) return errorResponse("NOT_FOUND", `Unknown pair: ${pairFilter}`, 404, ctx);

  const snapshots = targets.map(({ pair, token_in, token_out, label }) => {
    const snap = computePairSnapshot(pair, token_in, token_out, label);
    if (dbScores[pair] !== undefined) {
      const blended = Math.round((snap.safety_score + dbScores[pair]) / 2);
      snap.safety_score = blended;
      snap.tier = blended >= 70 ? "safe" : blended >= 40 ? "moderate" : "danger";
    }
    return snap;
  });

  const result = pairFilter ? snapshots[0] : { pairs: snapshots, updated_at: new Date().toISOString(), version: EDGE_CONFIG.VERSION };

  logResponse(ctx, 200);
  return jsonResponse(200, result, { "X-Request-Id": ctx.requestId });
});
