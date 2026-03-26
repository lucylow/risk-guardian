/**
 * _shared/riskEngineMock.ts — Pure-TS mock risk engine for edge.
 * No heavy deps. Used in demo/hackathon mode and as fallback.
 */
import type { RiskBreakdown } from "./types.ts";

// ─── Data sources (mock) ────────────────────────────────────────────────────

const PAIR_MEMPOOL: Record<string, number> = {
  ONE_USDC: 8, ONE_BTC: 6, USDC_ONE: 12, ONE_ETH: 18, HIGH_RISK_PAIR: 42,
};

const POOL_DATA: Record<string, { liquidity_usd: number; lp_concentration: number; volume_24h: number }> = {
  ONE_USDC:       { liquidity_usd: 8_500_000, lp_concentration: 0.18, volume_24h: 3_200_000 },
  ONE_BTC:        { liquidity_usd: 4_200_000, lp_concentration: 0.22, volume_24h: 1_800_000 },
  USDC_ONE:       { liquidity_usd: 8_500_000, lp_concentration: 0.18, volume_24h: 3_200_000 },
  ONE_ETH:        { liquidity_usd: 2_100_000, lp_concentration: 0.35, volume_24h:   900_000 },
  HIGH_RISK_PAIR: { liquidity_usd:    85_000, lp_concentration: 0.82, volume_24h:    12_000 },
};

const WALLET_SCORES: Record<string, { score: number; flags: string[]; tx_count: number; age_days: number }> = {
  suspicious: { score: 12, flags: ["suspicious_activity"], tx_count: 3,   age_days: 2   },
  new:        { score: 50, flags: ["new_wallet"],          tx_count: 1,   age_days: 0   },
};
const DEFAULT_WALLET = { score: 88, flags: [] as string[], tx_count: 340, age_days: 420 };

// ─── Clamp helper ────────────────────────────────────────────────────────────

function clamp(v: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, v));
}

// ─── Component scores ────────────────────────────────────────────────────────

export function computeSandwichRisk(pair: string, amount: number): number {
  const base = PAIR_MEMPOOL[pair] ?? 10;
  const pending = base + Math.floor(Math.random() * 10);
  const gasStd = 5 + Math.random() * 30;
  let risk = 10;
  if (pending > 30) risk += 35;
  else if (pending > 15) risk += 20;
  else if (pending > 8) risk += 8;
  risk += Math.min(amount / 5000, 1) * 25;
  if (gasStd > 20) risk += 5;
  return clamp(Math.round(risk), 0, 100);
}

export function computeLiquidityHealth(pair: string, amount: number): number {
  const pool = POOL_DATA[pair] ?? { liquidity_usd: 1_000_000, lp_concentration: 0.3, volume_24h: 500_000 };
  let health = 50;
  if (pool.liquidity_usd > 3_000_000) health += 25;
  else if (pool.liquidity_usd > 500_000) health += 10;
  if (pool.lp_concentration < 0.25) health += 20;
  else if (pool.lp_concentration > 0.6) health -= 25;
  if (pool.volume_24h > 1_000_000) health += 5;
  health -= Math.min(amount / 5000, 1) * 15;
  return clamp(Math.round(health), 0, 100);
}

export function computeWalletRisk(wallet: string): number {
  const rep = WALLET_SCORES[wallet] ?? DEFAULT_WALLET;
  return clamp(100 - rep.score, 0, 100);
}

export function getWalletReputation(wallet: string) {
  return WALLET_SCORES[wallet] ?? DEFAULT_WALLET;
}

export function getPoolHealth(pair: string) {
  return POOL_DATA[pair] ?? { liquidity_usd: 1_000_000, lp_concentration: 0.3, volume_24h: 500_000 };
}

export function getMempoolSnapshot(pair: string) {
  const base = PAIR_MEMPOOL[pair] ?? 10;
  return {
    pending_count: base + Math.floor(Math.random() * 10),
    gas_price_percentile: 40 + Math.random() * 80,
    gas_price_std: 5 + Math.random() * 30,
  };
}

// ─── Aggregate ───────────────────────────────────────────────────────────────

export interface MockRiskResult {
  safetyScore: number;
  tier: "safe" | "moderate" | "danger";
  breakdown: RiskBreakdown;
  sandwich: { score: number; features: Record<string, number> };
  liquidity: { score: number; features: Record<string, number> };
  walletR: { score: number; features: Record<string, number | string[]> };
}

export function computeFullRisk(pair: string, amount: number, wallet: string): MockRiskResult {
  const sandwichScore = computeSandwichRisk(pair, amount);
  const liquidityScore = computeLiquidityHealth(pair, amount);
  const walletScore = computeWalletRisk(wallet);
  const liquidityRisk = 100 - liquidityScore;

  const totalRisk = 0.5 * sandwichScore + 0.3 * liquidityRisk + 0.2 * walletScore;
  const safetyScore = clamp(Math.round(100 - totalRisk), 0, 100);
  const tier = safetyScore >= 70 ? "safe" : safetyScore >= 40 ? "moderate" : "danger";

  const mempool = getMempoolSnapshot(pair);
  const pool = getPoolHealth(pair);
  const rep = getWalletReputation(wallet);

  return {
    safetyScore,
    tier,
    breakdown: { sandwichRisk: sandwichScore, liquidityHealth: liquidityScore, walletRisk: walletScore },
    sandwich: { score: sandwichScore, features: { ...mempool, amount_usd: amount } },
    liquidity: { score: liquidityScore, features: { ...pool, amount_usd: amount } },
    walletR: { score: walletScore, features: { reputation_score: rep.score, tx_count: rep.tx_count, age_days: rep.age_days, flags: rep.flags } },
  };
}
