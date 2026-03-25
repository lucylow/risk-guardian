/**
 * market-pulse — returns a real-time risk snapshot for all major OneDEX pairs.
 *
 * GET / → array of { pair, token_in, token_out, safety_score, tier, sandwich_risk, liquidity_health, wallet_risk, timestamp }
 * GET /?pair=ONE_USDC → single pair snapshot
 *
 * Scores are computed fresh on every request (with jitter to simulate live data).
 * Average latency: ~5ms (no external calls, pure computation).
 */
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// ── Pair registry ─────────────────────────────────────────────────────────────

const PAIRS = [
  { pair: "ONE_USDC",       token_in: "ONE",   token_out: "USDC",  label: "ONE / USDC" },
  { pair: "ONE_BTC",        token_in: "ONE",   token_out: "BTC",   label: "ONE / BTC"  },
  { pair: "ONE_ETH",        token_in: "ONE",   token_out: "ETH",   label: "ONE / ETH"  },
  { pair: "USDC_ONE",       token_in: "USDC",  token_out: "ONE",   label: "USDC / ONE" },
  { pair: "HIGH_RISK_PAIR", token_in: "SHIT",  token_out: "USDC",  label: "⚠ SHIT / USDC" },
];

// ── Pool / mempool mock data ──────────────────────────────────────────────────

function getMempoolSnapshot(pair: string) {
  const base: Record<string, number> = {
    ONE_USDC: 8, ONE_BTC: 6, USDC_ONE: 12, ONE_ETH: 18, HIGH_RISK_PAIR: 42,
  };
  const b = base[pair] ?? 10;
  return {
    pending_count: b + Math.floor(Math.random() * 8),
    gas_price_std: 5 + Math.random() * 25,
  };
}

function getPoolHealth(pair: string) {
  const pools: Record<string, { liquidity_usd: number; lp_concentration: number; volume_24h: number }> = {
    ONE_USDC:       { liquidity_usd: 8_500_000, lp_concentration: 0.18, volume_24h: 3_200_000 },
    ONE_BTC:        { liquidity_usd: 4_200_000, lp_concentration: 0.22, volume_24h: 1_800_000 },
    USDC_ONE:       { liquidity_usd: 8_500_000, lp_concentration: 0.18, volume_24h: 3_200_000 },
    ONE_ETH:        { liquidity_usd: 2_100_000, lp_concentration: 0.35, volume_24h:   900_000 },
    HIGH_RISK_PAIR: { liquidity_usd:    85_000, lp_concentration: 0.82, volume_24h:    12_000 },
  };
  return pools[pair] ?? { liquidity_usd: 1_000_000, lp_concentration: 0.3, volume_24h: 500_000 };
}

// ── Risk computation (representative 1000 ONE trade) ─────────────────────────

function computePairSnapshot(pairId: string, token_in: string, token_out: string, label: string) {
  const AMOUNT = 1000; // representative swap amount for pulse
  const mempool = getMempoolSnapshot(pairId);
  const pool    = getPoolHealth(pairId);

  // Sandwich risk
  let sandwich = 10;
  if (mempool.pending_count > 30)      sandwich += 35;
  else if (mempool.pending_count > 15) sandwich += 20;
  else if (mempool.pending_count > 8)  sandwich += 8;
  sandwich += Math.round(Math.min(AMOUNT / 5000, 1) * 25);
  if (mempool.gas_price_std > 20) sandwich += 5;
  sandwich = Math.min(100, sandwich);

  // Liquidity health
  let health = 50;
  if (pool.liquidity_usd > 3_000_000)    health += 25;
  else if (pool.liquidity_usd > 500_000) health += 10;
  if (pool.lp_concentration < 0.25)      health += 20;
  else if (pool.lp_concentration > 0.6)  health -= 25;
  if (pool.volume_24h > 1_000_000)       health += 5;
  health = Math.max(0, Math.min(100, health));
  const liquidityRisk = 100 - health;

  // Wallet risk baseline (normal wallet for pulse)
  const walletRisk = 12;

  const totalRisk   = 0.5 * sandwich + 0.3 * liquidityRisk + 0.2 * walletRisk;
  const safetyScore = Math.max(0, Math.min(100, Math.round(100 - totalRisk)));
  const tier        = safetyScore >= 70 ? "safe" : safetyScore >= 40 ? "moderate" : "danger";

  // 24-h price change (mock, seeded deterministically per pair)
  const seed   = pairId.split("").reduce((a, c) => a + c.charCodeAt(0), 0);
  const change = ((seed % 17) - 8) * 0.1; // −0.8 % … +0.8 %

  return {
    pair:             pairId,
    token_in,
    token_out,
    label,
    safety_score:     safetyScore,
    tier,
    sandwich_risk:    sandwich,
    liquidity_health: health,
    wallet_risk:      walletRisk,
    pool_tvl_usd:     pool.liquidity_usd,
    volume_24h_usd:   pool.volume_24h,
    lp_concentration: pool.lp_concentration,
    price_change_24h: Number(change.toFixed(2)),
    timestamp:        new Date().toISOString(),
  };
}

// ── Handler ───────────────────────────────────────────────────────────────────

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  const json = (body: unknown, status = 200) =>
    new Response(JSON.stringify(body), {
      status,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  if (req.method !== "GET") return json({ error: "Method not allowed" }, 405);

  const url        = new URL(req.url);
  const pairFilter = url.searchParams.get("pair")?.toUpperCase();

  // Optional: enrich with most recent DB scores (last 5 min)
  let dbScores: Record<string, number> = {};
  try {
    const db = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );
    const since = new Date(Date.now() - 5 * 60 * 1000).toISOString();
    const { data } = await db
      .from("risk_assessments")
      .select("token_in, token_out, safety_score")
      .gte("created_at", since)
      .order("created_at", { ascending: false })
      .limit(100);

    if (data) {
      // Average the recent real scores per pair
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
  } catch {
    // DB enrichment is best-effort; fall through to computed scores
  }

  const targets = pairFilter
    ? PAIRS.filter((p) => p.pair === pairFilter)
    : PAIRS;

  if (targets.length === 0) return json({ error: `Unknown pair: ${pairFilter}` }, 404);

  const snapshots = targets.map(({ pair, token_in, token_out, label }) => {
    const snap = computePairSnapshot(pair, token_in, token_out, label);
    // Blend with recent real DB score if available
    if (dbScores[pair] !== undefined) {
      const blended = Math.round((snap.safety_score + dbScores[pair]) / 2);
      snap.safety_score = blended;
      snap.tier = blended >= 70 ? "safe" : blended >= 40 ? "moderate" : "danger";
    }
    return snap;
  });

  const result = pairFilter ? snapshots[0] : {
    pairs:     snapshots,
    updated_at: new Date().toISOString(),
    version:   "1.0.0",
  };

  return json(result);
});
