/**
 * OneChain ecosystem shared types.
 * Canonical interfaces for all OneChain adapter modules.
 */

// ── OneWallet ────────────────────────────────────────────────────────────────

export interface OneWalletContext {
  address: string;
  chainId: number;
  oneId?: string;
  usdoBalance?: string;
  octBalance?: string;
  zeroGasEligible?: boolean;
  connected: boolean;
}

// ── OneID ────────────────────────────────────────────────────────────────────

export interface OneIdProfile {
  id: string;
  displayName: string;
  linkedWallets: { chain: string; address: string }[];
  reputationTier: "veteran" | "active" | "new" | "flagged";
  riskFlags: string[];
  createdAt: string;
  crossChainActivity: number; // 0–100
}

// ── OneDEX ───────────────────────────────────────────────────────────────────

export interface PoolHealth {
  poolAddress: string;
  tokenInReserve: string;
  tokenOutReserve: string;
  tvlUsd: number;
  feeBps: number;
  lpConcentrationIndex: number; // 0–100, higher = more concentrated / risky
  volume24hUsd: number;
}

// ── OnePredict ───────────────────────────────────────────────────────────────

export interface VolatilityForecast {
  pair: string;
  horizonMinutes: number;
  volatilityIndex: number; // 0–100
  trend: "up" | "down" | "stable";
  confidence: number;      // 0–1
}

// ── OneTransfer ──────────────────────────────────────────────────────────────

export interface TransferPath {
  hops: number;
  containsBridge: boolean;
  usesRWA: boolean;
  estimatedTimeSeconds: number;
  pathDescription: string;
}

// ── OneRWA ────────────────────────────────────────────────────────────────────

export interface RwaExposure {
  totalUsd: number;
  collateralized: boolean;
  diversificationIndex: number; // 0–100
  assets: { name: string; valueUsd: number; type: string }[];
}

// ── OnePlay / OnePoker (GameFi) ──────────────────────────────────────────────

export interface GamificationProfile {
  safeTradeStreak: number;
  totalTrades: number;
  badges: GamificationBadge[];
  xp: number;
  level: number;
  activeQuests: string[];
}

export interface GamificationBadge {
  id: string;
  name: string;
  icon: string;
  earnedAt: string;
  description: string;
}

// ── Enriched Risk Context ────────────────────────────────────────────────────

export interface EnrichedRiskContext {
  userAddress: string;
  tokenIn: string;
  tokenOut: string;
  amountIn: number;
  oneWallet?: OneWalletContext;
  oneId?: OneIdProfile;
  poolHealth?: PoolHealth;
  volatility?: VolatilityForecast;
  rwaExposure?: RwaExposure;
  transferPath?: TransferPath;
  gamification?: GamificationProfile;
}
