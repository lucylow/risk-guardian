/**
 * _shared/types.ts — Canonical type contracts for all Risk Guardian edge functions.
 */

// ─── Request types ───────────────────────────────────────────────────────────

export interface SwapRequest {
  userAddress: string;
  tokenIn: string;
  tokenOut: string;
  amountIn: number;
  signature?: string;
  nonce?: string;
  /** Legacy field aliases */
  pair?: string;
  amount?: number;
  wallet?: string;
  user_address?: string;
}

export interface SettingsPayload {
  wallet: string;
  auto_protect_enabled?: boolean;
  risk_threshold?: number;
  auto_adjust_slippage?: boolean;
  notify_on_high_risk?: boolean;
}

// ─── Response types ──────────────────────────────────────────────────────────

export interface RiskBreakdown {
  sandwichRisk: number;
  liquidityHealth: number;
  walletRisk: number;
}

export interface RiskResponse {
  safetyScore: number;
  riskBreakdown: RiskBreakdown;
  explanation: string;
  recommendation: string;
  tier: "safe" | "moderate" | "danger";
  _meta: { ai_source: "llm" | "rules"; version: string; requestId: string };
}

export interface UserSettings {
  wallet_address: string;
  auto_protect_enabled: boolean;
  risk_threshold: number;
  auto_adjust_slippage: boolean;
  notify_on_high_risk: boolean;
}

export interface HistoryEntry {
  id: string;
  token_in: string;
  token_out: string;
  amount_in: number;
  safety_score: number;
  sandwich_risk: number;
  liquidity_health: number;
  wallet_risk: number;
  explanation: string | null;
  recommendation: string | null;
  created_at: string;
}

export interface HistoryStats {
  avg_safety_score: number;
  avg_sandwich_risk: number;
  avg_liquidity_health: number;
  avg_wallet_risk: number;
  safe_count: number;
  moderate_count: number;
  danger_count: number;
}

export interface PairSnapshot {
  pair: string;
  token_in: string;
  token_out: string;
  label: string;
  safety_score: number;
  tier: string;
  sandwich_risk: number;
  liquidity_health: number;
  wallet_risk: number;
  pool_tvl_usd: number;
  volume_24h_usd: number;
  lp_concentration: number;
  price_change_24h: number;
  timestamp: string;
}

// ─── Edge context ────────────────────────────────────────────────────────────

export interface EdgeContext {
  requestId: string;
  startTime: number;
  ip: string;
  region: string;
  method: string;
  path: string;
}

// ─── Error shape ─────────────────────────────────────────────────────────────

export interface ErrorResponse {
  error: string;
  code: string;
  requestId?: string;
  details?: unknown;
}

export type ErrorCode =
  | "VALIDATION_ERROR"
  | "AUTH_ERROR"
  | "RATE_LIMITED"
  | "UPSTREAM_ERROR"
  | "INTERNAL_ERROR"
  | "METHOD_NOT_ALLOWED"
  | "NOT_FOUND";
