import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// ─── Data Ingestion (mock of OneChain sources) ───────────────────────────────

function getMempoolSnapshot(pair: string) {
  const pairRisk: Record<string, number> = {
    ONE_USDC: 8, ONE_BTC: 6, USDC_ONE: 12, ONE_ETH: 18, HIGH_RISK_PAIR: 42,
  };
  const base = pairRisk[pair] ?? 10;
  const pending_count = base + Math.floor(Math.random() * 10);
  const gas_price_percentile = 40 + Math.random() * 80;
  const gas_price_std = 5 + Math.random() * 30;
  return { pending_count, gas_price_percentile, gas_price_std };
}

function getPoolHealth(pair: string) {
  const poolData: Record<string, { liquidity_usd: number; lp_concentration: number; volume_24h: number }> = {
    ONE_USDC:       { liquidity_usd: 8_500_000, lp_concentration: 0.18, volume_24h: 3_200_000 },
    ONE_BTC:        { liquidity_usd: 4_200_000, lp_concentration: 0.22, volume_24h: 1_800_000 },
    USDC_ONE:       { liquidity_usd: 8_500_000, lp_concentration: 0.18, volume_24h: 3_200_000 },
    ONE_ETH:        { liquidity_usd: 2_100_000, lp_concentration: 0.35, volume_24h:   900_000 },
    HIGH_RISK_PAIR: { liquidity_usd:    85_000, lp_concentration: 0.82, volume_24h:    12_000 },
  };
  return poolData[pair] ?? { liquidity_usd: 1_000_000, lp_concentration: 0.3, volume_24h: 500_000 };
}

function getWalletReputation(wallet: string) {
  if (wallet === "suspicious") return { score: 12, flags: ["suspicious_activity"], tx_count: 3, age_days: 2 };
  if (wallet === "new")        return { score: 50, flags: ["new_wallet"],          tx_count: 1, age_days: 0 };
  return                              { score: 88, flags: [],                      tx_count: 340, age_days: 420 };
}

// ─── Quantitative Risk Models (ML-style heuristics with feature engineering) ──

function detectSandwichRisk(pair: string, amount: number): { score: number; features: Record<string, number> } {
  const mempool = getMempoolSnapshot(pair);
  let risk = 10;
  if (mempool.pending_count > 30) risk += 35;
  else if (mempool.pending_count > 15) risk += 20;
  else if (mempool.pending_count > 8)  risk += 8;
  const amountFactor = Math.min(amount / 5000, 1) * 25;
  const gasFactor    = mempool.gas_price_std > 20 ? 5 : 0;
  const score = Math.min(100, Math.round(risk + amountFactor + gasFactor));
  return { score, features: { ...mempool, amount_usd: amount, amount_factor: Math.round(amountFactor) } };
}

function assessLiquidityHealth(pair: string, amount: number): { score: number; features: Record<string, number> } {
  const pool = getPoolHealth(pair);
  let health = 50;
  if (pool.liquidity_usd > 3_000_000) health += 25;
  else if (pool.liquidity_usd > 500_000) health += 10;
  if (pool.lp_concentration < 0.25) health += 20;
  else if (pool.lp_concentration > 0.6) health -= 25;
  if (pool.volume_24h > 1_000_000) health += 5;
  const amountFactor = Math.min(amount / 5000, 1) * 15;
  const score = Math.max(0, Math.min(100, Math.round(health - amountFactor)));
  return { score, features: { ...pool, amount_usd: amount, amount_impact: Math.round(amountFactor) } };
}

function assessWalletRisk(wallet: string): { score: number; features: Record<string, number | string[]> } {
  const rep = getWalletReputation(wallet);
  const score = Math.max(0, Math.min(100, 100 - rep.score));
  return { score, features: { reputation_score: rep.score, tx_count: rep.tx_count, age_days: rep.age_days, flags: rep.flags } };
}

// ─── Compute raw scores ───────────────────────────────────────────────────────

function computeRawScores(pair: string, amount: number, wallet: string) {
  const sandwich  = detectSandwichRisk(pair, amount);
  const liquidity = assessLiquidityHealth(pair, amount);
  const walletR   = assessWalletRisk(wallet);
  const liquidityRisk = 100 - liquidity.score;
  const totalRisk     = 0.5 * sandwich.score + 0.3 * liquidityRisk + 0.2 * walletR.score;
  const safetyScore   = Math.max(0, Math.min(100, Math.round(100 - totalRisk)));
  const tier = safetyScore >= 70 ? "safe" : safetyScore >= 40 ? "moderate" : "danger";
  return { safetyScore, sandwich, liquidity, walletR, tier } as const;
}

// ─── LLM-powered explanation via Lovable AI Gateway ──────────────────────────

async function generateAIExplanation(
  pair: string,
  amount: number,
  wallet: string,
  scores: ReturnType<typeof computeRawScores>
): Promise<{ explanation: string; recommendation: string }> {
  const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
  if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

  const systemPrompt = `You are The Risk Oracle, an expert DeFi risk analyst embedded in OneDEX.
Your job: analyze a pending swap and produce a concise, actionable risk explanation and a one-sentence recommendation.
Guidelines:
- Explanation: 2-3 sentences. Be specific about the numbers. Explain *why* each component is risky or safe.
- Recommendation: exactly one sentence starting with an emoji (✅ 🟡 🚨). Be direct and actionable.
- Tone: technical but user-friendly. No fluff.
- Use DeFi terminology (MEV, sandwich bots, LP concentration, price impact, slippage).`;

  const userPrompt = `Swap analysis request:
- Token pair: ${pair}
- Swap amount: ${amount} ONE (~$${amount} USD equivalent)
- Wallet profile: ${wallet} (OneID reputation score: ${(scores.walletR.features as any).reputation_score}/100)
- Wallet tx history: ${(scores.walletR.features as any).tx_count} transactions, ${(scores.walletR.features as any).age_days} days old

Quantitative risk scores (0-100 scale):
- Safety Score: ${scores.safetyScore}/100 (tier: ${scores.tier})
- Sandwich Attack Risk: ${scores.sandwich.score}/100
  - Pending txs in mempool: ${(scores.sandwich.features as any).pending_count}
  - Gas price volatility (std): ${Math.round((scores.sandwich.features as any).gas_price_std)}
  - Amount impact factor: +${(scores.sandwich.features as any).amount_factor}pts
- Liquidity Health: ${scores.liquidity.score}/100
  - Pool TVL: $${((scores.liquidity.features as any).liquidity_usd / 1_000_000).toFixed(2)}M
  - LP concentration (Gini): ${(scores.liquidity.features as any).lp_concentration}
  - 24h volume: $${Math.round((scores.liquidity.features as any).volume_24h / 1000)}K
- Wallet Risk: ${scores.walletR.score}/100
  - Flags: ${JSON.stringify((scores.walletR.features as any).flags)}

Respond with a JSON object with exactly two keys: "explanation" (string) and "recommendation" (string).`;

  const resp = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${LOVABLE_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "google/gemini-3-flash-preview",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user",   content: userPrompt   },
      ],
      response_format: { type: "json_object" },
    }),
  });

  if (resp.status === 429) throw new Error("RATE_LIMITED");
  if (resp.status === 402) throw new Error("PAYMENT_REQUIRED");
  if (!resp.ok) throw new Error(`AI gateway error: ${resp.status}`);

  const data = await resp.json();
  const content = data.choices?.[0]?.message?.content ?? "{}";
  const parsed = JSON.parse(content);
  return {
    explanation:    parsed.explanation    ?? "",
    recommendation: parsed.recommendation ?? "",
  };
}

// ─── Fallback rule-based explanation (if AI fails) ───────────────────────────

function ruleBasedExplanation(scores: ReturnType<typeof computeRawScores>) {
  let explanation = "";
  if (scores.sandwich.score > 40)       explanation += "⚡ High sandwich probability: elevated mempool activity targeting this pair. ";
  else if (scores.sandwich.score > 20)  explanation += "⚠ Moderate sandwich risk — some bot activity detected. ";
  else                                  explanation += "✓ Sandwich risk is low — mempool looks clean. ";
  if (scores.liquidity.score < 50)      explanation += "💧 Pool is shallow — your trade will cause significant price impact. ";
  else if (scores.liquidity.score < 70) explanation += "💧 Pool health is moderate; monitor slippage. ";
  else                                  explanation += "💧 Pool has deep liquidity — price impact minimal. ";
  const repScore = (scores.walletR.features as any).reputation_score;
  if (repScore < 30)       explanation += "🔴 Wallet flagged by OneID for suspicious on-chain activity.";
  else if (repScore < 65)  explanation += "🟡 Limited wallet history — no flags but verify contract addresses.";
  else                     explanation += "✅ Wallet reputation is clean per OneID.";

  const recommendation =
    scores.tier === "danger"   ? "🚨 Do NOT proceed — extremely high risk. Consider a different pair or smaller amount." :
    scores.tier === "moderate" ? "🟡 Proceed with caution — reduce swap size or increase slippage tolerance." :
                                 "✅ Low risk — safe to swap. Always double-check the token contract address.";
  return { explanation, recommendation };
}

// ─── Handler ─────────────────────────────────────────────────────────────────

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  if (req.method === "GET") {
    return new Response(
      JSON.stringify({ status: "ok", version: "2.0.0", service: "Risk Oracle API", ai: "Lovable AI Gateway" }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  try {
    const body = await req.json();
    const { pair = "ONE_USDC", amount = 1000, wallet = "normal", user_address = "0xdemo" } = body;

    if (typeof amount !== "number" || amount <= 0) {
      return new Response(
        JSON.stringify({ error: "amount must be a positive number" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // 1. Compute quantitative scores
    const scores = computeRawScores(pair, amount, wallet);

    // 2. Generate AI explanation (with fallback)
    let explanation: string;
    let recommendation: string;
    try {
      const ai = await generateAIExplanation(pair, amount, wallet, scores);
      explanation    = ai.explanation;
      recommendation = ai.recommendation;
    } catch (aiErr: unknown) {
      const msg = aiErr instanceof Error ? aiErr.message : String(aiErr);
      console.warn("AI explanation failed, using rule-based fallback:", msg);
      const fallback = ruleBasedExplanation(scores);
      explanation    = fallback.explanation;
      recommendation = fallback.recommendation;
    }

    const result = {
      safety_score: scores.safetyScore,
      risk_breakdown: {
        sandwich_risk:   scores.sandwich.score,
        liquidity_health: scores.liquidity.score,
        wallet_risk:      scores.walletR.score,
      },
      explanation,
      recommendation,
      recommendation_type: scores.tier,
    };

    // 3. Log to DB (fire and forget)
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );
    supabase.from("risk_assessments").insert({
      user_address,
      token_in:         pair.split("_")[0] ?? pair,
      token_out:        pair.split("_")[1] ?? "USDC",
      amount_in:        amount,
      safety_score:     result.safety_score,
      sandwich_risk:    result.risk_breakdown.sandwich_risk,
      liquidity_health: result.risk_breakdown.liquidity_health,
      wallet_risk:      result.risk_breakdown.wallet_risk,
      explanation:      result.explanation,
      recommendation:   result.recommendation,
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
