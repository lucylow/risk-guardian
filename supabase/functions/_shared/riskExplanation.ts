/**
 * _shared/riskExplanation.ts — Rule-based and AI-powered explanation generators.
 */
import type { MockRiskResult } from "./riskEngineMock.ts";
import { EDGE_CONFIG } from "./config.ts";

// ─── Rule-based fallback ─────────────────────────────────────────────────────

export function ruleBasedExplanation(scores: MockRiskResult): { explanation: string; recommendation: string } {
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

// ─── AI-powered explanation ──────────────────────────────────────────────────

export async function generateAIExplanation(
  pair: string,
  amount: number,
  wallet: string,
  scores: MockRiskResult,
): Promise<{ explanation: string; recommendation: string }> {
  if (!EDGE_CONFIG.LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

  const wf = scores.walletR.features as Record<string, number | string[]>;
  const sf = scores.sandwich.features as Record<string, number>;
  const lf = scores.liquidity.features as Record<string, number>;

  const systemPrompt = `You are The Risk Oracle, an expert DeFi risk analyst embedded in OneDEX.
Analyze a pending swap and produce a concise, actionable risk explanation and a one-sentence recommendation.
Guidelines:
- Explanation: 2-3 sentences. Be specific about the numbers. Explain *why* each component is risky or safe.
- Recommendation: exactly one sentence starting with an emoji (✅ 🟡 🚨). Be direct and actionable.
- Tone: technical but user-friendly. No fluff.
- Use DeFi terminology (MEV, sandwich bots, LP concentration, price impact, slippage).
- Respond ONLY with a valid JSON object: {"explanation": "...", "recommendation": "..."}`;

  const userPrompt = `Swap: ${pair} | Amount: $${amount} | Wallet: ${wallet}
Safety Score: ${scores.safetyScore}/100 (${scores.tier})
Sandwich Risk: ${scores.sandwich.score}/100 — mempool pending: ${sf.pending_count}, gas std: ${Math.round(sf.gas_price_std)}
Liquidity Health: ${scores.liquidity.score}/100 — TVL: $${((lf.liquidity_usd ?? 0) / 1e6).toFixed(2)}M, LP concentration: ${lf.lp_concentration}, 24h vol: $${Math.round((lf.volume_24h ?? 0) / 1000)}K
Wallet Risk: ${scores.walletR.score}/100 — OneID score: ${wf.reputation_score}, txs: ${wf.tx_count}, age: ${wf.age_days}d, flags: ${JSON.stringify(wf.flags)}`;

  const resp = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${EDGE_CONFIG.LOVABLE_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "google/gemini-2.5-flash",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
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
  const parsed = JSON.parse(content);

  if (!parsed.explanation || !parsed.recommendation) throw new Error("AI response missing fields");
  return { explanation: parsed.explanation.trim(), recommendation: parsed.recommendation.trim() };
}

/** Try AI, fall back to rules */
export async function getExplanation(
  pair: string,
  amount: number,
  wallet: string,
  scores: MockRiskResult,
): Promise<{ explanation: string; recommendation: string; aiSource: "llm" | "rules" }> {
  try {
    const ai = await generateAIExplanation(pair, amount, wallet, scores);
    return { ...ai, aiSource: "llm" };
  } catch (err) {
    console.warn("AI explanation failed, using rules:", err instanceof Error ? err.message : err);
    const fb = ruleBasedExplanation(scores);
    return { ...fb, aiSource: "rules" };
  }
}
