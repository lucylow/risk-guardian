import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// ─── Data Ingestion (mock of OneChain sources) ───────────────────────────────

function getMempoolSnapshot(pair: string) {
  // Simulate pending tx count based on pair volatility
  const pairRisk: Record<string, number> = {
    ONE_USDC: 8,
    ONE_BTC: 6,
    USDC_ONE: 12,
    ONE_ETH: 18,
    HIGH_RISK_PAIR: 42,
  };
  const base = pairRisk[pair] ?? 10;
  const pending_count = base + Math.floor(Math.random() * 10);
  return { pending_count };
}

function getPoolHealth(pair: string) {
  const poolData: Record<string, { liquidity_usd: number; lp_concentration: number }> = {
    ONE_USDC:       { liquidity_usd: 8_500_000, lp_concentration: 0.18 },
    ONE_BTC:        { liquidity_usd: 4_200_000, lp_concentration: 0.22 },
    USDC_ONE:       { liquidity_usd: 8_500_000, lp_concentration: 0.18 },
    ONE_ETH:        { liquidity_usd: 2_100_000, lp_concentration: 0.35 },
    HIGH_RISK_PAIR: { liquidity_usd:    85_000, lp_concentration: 0.82 },
  };
  return poolData[pair] ?? { liquidity_usd: 1_000_000, lp_concentration: 0.3 };
}

function getWalletReputation(wallet: string) {
  // wallet parameter is "normal" | "new" | "suspicious" for demo
  if (wallet === "suspicious") return { score: 12, flags: ["suspicious_activity"] };
  if (wallet === "new")        return { score: 50, flags: ["new_wallet"] };
  return { score: 88, flags: [] };
}

// ─── AI Model Stubs ──────────────────────────────────────────────────────────

function detectSandwichRisk(pair: string, amount: number): number {
  const mempool = getMempoolSnapshot(pair);
  let risk = 10;
  if (mempool.pending_count > 30) risk += 35;
  else if (mempool.pending_count > 15) risk += 20;
  else if (mempool.pending_count > 8)  risk += 8;
  const amountFactor = Math.min(amount / 5000, 1) * 25;
  return Math.min(100, Math.round(risk + amountFactor));
}

function assessLiquidityHealth(pair: string, amount: number): number {
  const pool = getPoolHealth(pair);
  let health = 50;
  if (pool.liquidity_usd > 3_000_000) health += 25;
  else if (pool.liquidity_usd > 500_000) health += 10;
  if (pool.lp_concentration < 0.25) health += 20;
  else if (pool.lp_concentration > 0.6) health -= 25;
  const amountFactor = Math.min(amount / 5000, 1) * 15;
  return Math.max(0, Math.min(100, Math.round(health - amountFactor)));
}

function assessWalletRisk(wallet: string): number {
  const rep = getWalletReputation(wallet);
  return Math.max(0, Math.min(100, 100 - rep.score));
}

// ─── Risk Engine (matches Python FastAPI logic) ───────────────────────────────

function computeRiskScore(pair: string, amount: number, wallet: string) {
  const sandwich  = detectSandwichRisk(pair, amount);
  const liquidity = assessLiquidityHealth(pair, amount);
  const walletRisk = assessWalletRisk(wallet);

  // Weighted safety score: sandwich 0.5, liquidity_risk 0.3, wallet 0.2
  const liquidityRisk = 100 - liquidity;
  const totalRisk = 0.5 * sandwich + 0.3 * liquidityRisk + 0.2 * walletRisk;
  const safetyScore = Math.max(0, Math.min(100, Math.round(100 - totalRisk)));

  // Explanation
  let explanation = "";
  if (sandwich > 40)       explanation += "⚡ High sandwich probability: 3+ pending txs in mempool targeting this pair with higher gas. ";
  else if (sandwich > 20)  explanation += "⚠ Moderate sandwich risk — some bot activity detected in the mempool. ";
  else                     explanation += "✓ Sandwich risk is low — mempool looks clean for this pair. ";

  if (liquidity < 50)      explanation += "💧 Pool is shallow — your trade will cause significant price impact. ";
  else if (liquidity < 70) explanation += "💧 Pool health is moderate; acceptable but monitor slippage. ";
  else                     explanation += "💧 Pool has deep liquidity — price impact will be minimal. ";

  const rep = getWalletReputation(wallet);
  if (rep.score < 30)      explanation += "🔴 Wallet flagged by OneID for suspicious on-chain activity.";
  else if (rep.score < 65) explanation += "🟡 Limited wallet history — no flags but verify contract addresses.";
  else                     explanation += "✅ Wallet reputation is clean per OneID.";

  // Recommendation
  let recommendation: string;
  let recommendationType: "safe" | "moderate" | "danger";
  if (safetyScore < 30) {
    recommendation = "Do NOT proceed — extremely high risk. Consider a different pair or a much smaller amount.";
    recommendationType = "danger";
  } else if (safetyScore < 60) {
    recommendation = "Proceed with caution. Consider reducing your swap size or increasing slippage tolerance to mitigate risk.";
    recommendationType = "moderate";
  } else {
    recommendation = "Low risk — safe to swap. Always double-check the token contract address before confirming.";
    recommendationType = "safe";
  }

  return {
    safety_score: safetyScore,
    risk_breakdown: {
      sandwich_risk: sandwich,
      liquidity_health: liquidity,
      wallet_risk: walletRisk,
    },
    explanation,
    recommendation,
    recommendation_type: recommendationType,
  };
}

// ─── Handler ─────────────────────────────────────────────────────────────────

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  // Health check
  if (req.method === "GET") {
    return new Response(
      JSON.stringify({ status: "ok", version: "1.0.0", service: "Risk Oracle API" }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  try {
    const body = await req.json();
    const {
      pair = "ONE_USDC",
      amount = 1000,
      wallet = "normal",
      user_address = "0xdemo",
    } = body;

    // Validate inputs
    if (typeof amount !== "number" || amount <= 0) {
      return new Response(
        JSON.stringify({ error: "amount must be a positive number" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Compute risk
    const result = computeRiskScore(pair, amount, wallet);

    // Log to DB (fire and forget — don't block the response)
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    supabase.from("risk_assessments").insert({
      user_address,
      token_in: pair.split("_")[0] ?? pair,
      token_out: pair.split("_")[1] ?? "USDC",
      amount_in: amount,
      safety_score: result.safety_score,
      sandwich_risk: result.risk_breakdown.sandwich_risk,
      liquidity_health: result.risk_breakdown.liquidity_health,
      wallet_risk: result.risk_breakdown.wallet_risk,
      explanation: result.explanation,
      recommendation: result.recommendation,
    }).then(({ error }) => {
      if (error) console.error("DB log error:", error.message);
    });

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("Risk assess error:", err);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
