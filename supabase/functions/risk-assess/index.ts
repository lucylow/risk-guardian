import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// ─── Input validation ─────────────────────────────────────────────────────────

interface AssessBody {
  pair: string;
  amount: number;
  wallet: string;
  user_address: string;
}

function validateBody(body: unknown): { valid: true; data: AssessBody } | { valid: false; error: string } {
  if (!body || typeof body !== "object") return { valid: false, error: "Request body must be a JSON object" };
  const b = body as Record<string, unknown>;

  const pair = typeof b.pair === "string" && b.pair.trim() ? b.pair.trim().toUpperCase() : "ONE_USDC";

  const amount = Number(b.amount);
  if (isNaN(amount) || amount <= 0) return { valid: false, error: "amount must be a positive number" };
  if (amount > 1_000_000_000)       return { valid: false, error: "amount exceeds maximum allowed value" };

  const wallet = typeof b.wallet === "string" && b.wallet.trim() ? b.wallet.trim() : "normal";
  const user_address = typeof b.user_address === "string" && b.user_address.trim()
    ? b.user_address.trim()
    : "0xdemo";

  return { valid: true, data: { pair, amount, wallet, user_address } };
}

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
  if (wallet === "suspicious") return { score: 12, flags: ["suspicious_activity"], tx_count: 3,   age_days: 2   };
  if (wallet === "new")        return { score: 50, flags: ["new_wallet"],          tx_count: 1,   age_days: 0   };
  return                              { score: 88, flags: [],                      tx_count: 340, age_days: 420 };
}

// ─── Quantitative Risk Models ─────────────────────────────────────────────────

function detectSandwichRisk(pair: string, amount: number): { score: number; features: Record<string, number> } {
  const mempool = getMempoolSnapshot(pair);
  let risk = 10;
  if (mempool.pending_count > 30)      risk += 35;
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
  if (pool.liquidity_usd > 3_000_000)       health += 25;
  else if (pool.liquidity_usd > 500_000)    health += 10;
  if (pool.lp_concentration < 0.25)         health += 20;
  else if (pool.lp_concentration > 0.6)     health -= 25;
  if (pool.volume_24h > 1_000_000)          health += 5;
  const amountFactor = Math.min(amount / 5000, 1) * 15;
  const score = Math.max(0, Math.min(100, Math.round(health - amountFactor)));
  return { score, features: { ...pool, amount_usd: amount, amount_impact: Math.round(amountFactor) } };
}

function assessWalletRisk(wallet: string): { score: number; features: Record<string, number | string[]> } {
  const rep = getWalletReputation(wallet);
  const score = Math.max(0, Math.min(100, 100 - rep.score));
  return { score, features: { reputation_score: rep.score, tx_count: rep.tx_count, age_days: rep.age_days, flags: rep.flags } };
}

function computeRawScores(pair: string, amount: number, wallet: string) {
  const sandwich  = detectSandwichRisk(pair, amount);
  const liquidity = assessLiquidityHealth(pair, amount);
  const walletR   = assessWalletRisk(wallet);
  const liquidityRisk = 100 - liquidity.score;
  // Weights: Sandwich 50%, Liquidity 30%, Wallet 20%
  const totalRisk   = 0.5 * sandwich.score + 0.3 * liquidityRisk + 0.2 * walletR.score;
  const safetyScore = Math.max(0, Math.min(100, Math.round(100 - totalRisk)));
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

  const walletFeatures = scores.walletR.features as Record<string, number | string[]>;
  const sandwichFeatures = scores.sandwich.features as Record<string, number>;
  const liquidityFeatures = scores.liquidity.features as Record<string, number>;

  const systemPrompt = `You are The Risk Oracle, an expert DeFi risk analyst embedded in OneDEX.
Analyze a pending swap and produce a concise, actionable risk explanation and a one-sentence recommendation.
Guidelines:
- Explanation: 2-3 sentences. Be specific about the numbers. Explain *why* each component is risky or safe.
- Recommendation: exactly one sentence starting with an emoji (✅ 🟡 🚨). Be direct and actionable.
- Tone: technical but user-friendly. No fluff. No repeating the raw numbers verbatim.
- Use DeFi terminology (MEV, sandwich bots, LP concentration, price impact, slippage).
- Respond ONLY with a valid JSON object: {"explanation": "...", "recommendation": "..."}`;

  const userPrompt = `Swap: ${pair} | Amount: $${amount} | Wallet: ${wallet}
Safety Score: ${scores.safetyScore}/100 (${scores.tier})
Sandwich Risk: ${scores.sandwich.score}/100 — mempool pending: ${sandwichFeatures.pending_count}, gas std: ${Math.round(sandwichFeatures.gas_price_std)}
Liquidity Health: ${scores.liquidity.score}/100 — TVL: $${((liquidityFeatures.liquidity_usd ?? 0) / 1e6).toFixed(2)}M, LP concentration: ${liquidityFeatures.lp_concentration}, 24h vol: $${Math.round((liquidityFeatures.volume_24h ?? 0) / 1000)}K
Wallet Risk: ${scores.walletR.score}/100 — OneID score: ${walletFeatures.reputation_score}, txs: ${walletFeatures.tx_count}, age: ${walletFeatures.age_days}d, flags: ${JSON.stringify(walletFeatures.flags)}`;

  const resp = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${LOVABLE_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "google/gemini-2.5-flash",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user",   content: userPrompt   },
      ],
      response_format: { type: "json_object" },
      temperature: 0.3,
      max_tokens: 300,
    }),
  });

  if (resp.status === 429) throw new Error("RATE_LIMITED");
  if (resp.status === 402) throw new Error("PAYMENT_REQUIRED");
  if (!resp.ok) throw new Error(`AI gateway ${resp.status}: ${await resp.text()}`);

  const data = await resp.json();
  const content = data.choices?.[0]?.message?.content ?? "{}";

  let parsed: { explanation?: string; recommendation?: string };
  try {
    parsed = JSON.parse(content);
  } catch {
    throw new Error("AI returned invalid JSON");
  }

  if (!parsed.explanation || !parsed.recommendation) throw new Error("AI response missing fields");

  return {
    explanation:    parsed.explanation.trim(),
    recommendation: parsed.recommendation.trim(),
  };
}

// ─── Fallback rule-based explanation ─────────────────────────────────────────

function ruleBasedExplanation(scores: ReturnType<typeof computeRawScores>) {
  const parts: string[] = [];

  if (scores.sandwich.score > 40)       parts.push("⚡ High sandwich probability: elevated mempool activity targeting this pair.");
  else if (scores.sandwich.score > 20)  parts.push("⚠ Moderate sandwich risk — some bot activity detected.");
  else                                  parts.push("✓ Sandwich risk is low — mempool looks clean.");

  if (scores.liquidity.score < 50)      parts.push("💧 Pool is shallow — your trade will cause significant price impact.");
  else if (scores.liquidity.score < 70) parts.push("💧 Pool health is moderate; monitor slippage carefully.");
  else                                  parts.push("💧 Pool has deep liquidity — price impact minimal.");

  const repScore = (scores.walletR.features as Record<string, number>).reputation_score ?? 50;
  if (repScore < 30)      parts.push("🔴 Wallet flagged by OneID for suspicious on-chain activity.");
  else if (repScore < 65) parts.push("🟡 Limited wallet history — no flags, but verify contract addresses.");
  else                    parts.push("✅ Wallet reputation is clean per OneID.");

  const recommendation =
    scores.tier === "danger"   ? "🚨 Do NOT proceed — extremely high risk; consider a different pair or smaller amount." :
    scores.tier === "moderate" ? "🟡 Proceed with caution — reduce swap size or increase slippage tolerance." :
                                 "✅ Low risk — safe to swap; always double-check the token contract address.";

  return { explanation: parts.join(" "), recommendation };
}

// ─── DB logging (fire and forget) ────────────────────────────────────────────

function logToDatabase(
  supabase: ReturnType<typeof createClient>,
  data: AssessBody,
  scores: ReturnType<typeof computeRawScores>,
  result: { explanation: string; recommendation: string }
): void {
  supabase.from("risk_assessments").insert({
    user_address:     data.user_address,
    token_in:         data.pair.split("_")[0] ?? data.pair,
    token_out:        data.pair.split("_")[1] ?? "USDC",
    amount_in:        data.amount,
    safety_score:     scores.safetyScore,
    sandwich_risk:    scores.sandwich.score,
    liquidity_health: scores.liquidity.score,
    wallet_risk:      scores.walletR.score,
    explanation:      result.explanation,
    recommendation:   result.recommendation,
  }).then(({ error }) => {
    if (error) console.error("DB log error:", error.message);
  });
}

// ─── Handler ─────────────────────────────────────────────────────────────────

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  if (req.method === "GET") {
    return new Response(
      JSON.stringify({ status: "ok", version: "2.1.0", service: "Risk Oracle API", ai: "Lovable AI Gateway (Gemini 2.5 Flash)" }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  if (req.method !== "POST") {
    return new Response(
      JSON.stringify({ error: "Method not allowed" }),
      { status: 405, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  let rawBody: unknown;
  try {
    rawBody = await req.json();
  } catch {
    return new Response(
      JSON.stringify({ error: "Invalid JSON body" }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  const validation = validateBody(rawBody);
  if (!validation.valid) {
    return new Response(
      JSON.stringify({ error: validation.error }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  const { pair, amount, wallet, user_address } = validation.data;

  try {
    // 1. Compute quantitative scores
    const scores = computeRawScores(pair, amount, wallet);

    // 2. Generate AI explanation with graceful fallback
    let explanation: string;
    let recommendation: string;
    let aiSource: "llm" | "rules" = "llm";

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
      aiSource       = "rules";
    }

    const result = {
      safety_score: scores.safetyScore,
      risk_breakdown: {
        sandwich_risk:    scores.sandwich.score,
        liquidity_health: scores.liquidity.score,
        wallet_risk:      scores.walletR.score,
      },
      explanation,
      recommendation,
      recommendation_type: scores.tier,
      _meta: { ai_source: aiSource, version: "2.1.0" },
    };

    // 3. Log to DB (non-blocking)
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );
    logToDatabase(supabase, validation.data, scores, { explanation, recommendation });

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (err) {
    console.error("Risk assess unhandled error:", err);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
