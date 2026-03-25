import { supabase } from "@/integrations/supabase/client";
import { isMockModeEnabled } from "@/lib/mockMode";
import { getMockRisk } from "@/mocks/mockData";

// ── Types ─────────────────────────────────────────────────────────────────────

export interface RiskRequest {
  user_address: string;
  token_in: string;
  token_out: string;
  amount_in: number;
  signature: string;
  nonce: string;
}

export interface RiskBreakdown {
  sandwich_risk: number;
  liquidity_health: number;
  wallet_risk: number;
}

export interface RiskResponse {
  safety_score: number;
  risk_breakdown: RiskBreakdown;
  explanation: string;
  recommendation: string;
  recommendation_type: "safe" | "moderate" | "danger";
}

export interface Suggestion {
  type: string;
  amount?: number;
  safety_score: number | null;
  description: string;
  recommendation: string;
}

export interface SuggestResponse {
  adaptive_threshold: number | null;
  suggestions: Suggestion[];
}

export interface UserSettings {
  wallet_address: string;
  auto_protect_enabled: boolean;
  risk_threshold: number;
  auto_adjust_slippage: boolean;
  notify_on_high_risk: boolean;
}

export interface PairSnapshot {
  pair: string;
  token_in: string;
  token_out: string;
  label: string;
  safety_score: number;
  tier: "safe" | "moderate" | "danger";
  sandwich_risk: number;
  liquidity_health: number;
  wallet_risk: number;
  pool_tvl_usd: number;
  volume_24h_usd: number;
  lp_concentration: number;
  price_change_24h: number;
  timestamp: string;
}

export interface MarketPulseResponse {
  pairs: PairSnapshot[];
  updated_at: string;
  version: string;
}

export interface WalletHistoryEntry {
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

export interface WalletHistoryResponse {
  wallet: string;
  total: number;
  limit: number;
  offset: number;
  data: WalletHistoryEntry[];
  stats: {
    avg_safety_score: number;
    avg_sandwich_risk: number;
    avg_liquidity_health: number;
    avg_wallet_risk: number;
    safe_count: number;
    moderate_count: number;
    danger_count: number;
  } | null;
  fetched_at: string;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

const AUTH_TOKEN_KEY = "risk_oracle_token";

export function setRiskOracleToken(token: string): void {
  localStorage.setItem(AUTH_TOKEN_KEY, token);
}

export function getRiskOracleToken(): string | null {
  return localStorage.getItem(AUTH_TOKEN_KEY);
}

function pairFromRequest(request: RiskRequest): string {
  return `${request.token_in}_${request.token_out}`.toUpperCase();
}

// ── Risk Assessment ────────────────────────────────────────────────────────────

export async function assessRisk(request: RiskRequest): Promise<RiskResponse> {
  if (isMockModeEnabled()) {
    return new Promise((resolve) => {
      setTimeout(() => {
        const mock = getMockRisk(request.token_in, request.token_out, request.amount_in);
        resolve({
          safety_score: mock.safetyScore,
          risk_breakdown: {
            sandwich_risk:    mock.sandwichRisk,
            liquidity_health: mock.liquidityHealth,
            wallet_risk:      mock.walletRisk,
          },
          explanation:         mock.explanation,
          recommendation:      mock.recommendation,
          recommendation_type:
            mock.safetyScore >= 70 ? "safe" : mock.safetyScore >= 40 ? "moderate" : "danger",
        });
      }, 500);
    });
  }

  const pair = pairFromRequest(request);
  const { data, error } = await supabase.functions.invoke("risk-assess", {
    body: { pair, amount: request.amount_in, wallet: "normal", user_address: request.user_address },
  });
  if (error) throw error;
  return data as RiskResponse;
}

// ── Swap Suggestions (computed client-side from edge function score) ──────────

export async function getSwapSuggestions(request: RiskRequest): Promise<SuggestResponse> {
  const base = await assessRisk(request);
  const suggestions: Suggestion[] = [0.5, 0.25, 0.1].map((f) => {
    const newAmount  = Number((request.amount_in * f).toFixed(2));
    const safetyBump = Math.min(15, Math.round((1 - f) * 20));
    return {
      type:           "reduce_amount",
      amount:          newAmount,
      safety_score:    Math.min(99, base.safety_score + safetyBump),
      description:    `Swap ${newAmount} ${request.token_in} instead of ${request.amount_in}`,
      recommendation: "Smaller trade size lowers sandwich and liquidity impact.",
    };
  });
  suggestions.push({
    type:           "alternative_pool",
    safety_score:   Math.min(99, base.safety_score + 8),
    description:    `Route through deeper ${request.token_out}-${request.token_in} liquidity`,
    recommendation: "Alternative routing can reduce slippage and MEV pressure.",
  });
  return { adaptive_threshold: 50, suggestions };
}

export async function logSuggestionFeedback(params: {
  user_address: string;
  suggestion_type: string;
  suggested_params: Record<string, unknown>;
  safety_score?: number | null;
  accepted: boolean;
}): Promise<void> {
  console.debug("[RiskOracle] suggestion feedback:", params);
}

// ── User Settings ─────────────────────────────────────────────────────────────

const SETTINGS_DEFAULTS: Omit<UserSettings, "wallet_address"> = {
  auto_protect_enabled: true,
  risk_threshold:       60,
  auto_adjust_slippage: true,
  notify_on_high_risk:  true,
};

export async function getUserSettings(wallet: string): Promise<UserSettings> {
  if (isMockModeEnabled() || !wallet || wallet === "0xdemo_user") {
    return { wallet_address: wallet, ...SETTINGS_DEFAULTS };
  }
  // supabase.functions.invoke doesn't support GET query params, so use fetch directly
  const url = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/user-settings?wallet=${encodeURIComponent(wallet)}`;
  const res = await fetch(url, {
    headers: {
      apikey:        import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
      Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
    },
  });
  if (!res.ok) return { wallet_address: wallet, ...SETTINGS_DEFAULTS };
  return (await res.json()) as UserSettings;
}

export async function saveUserSettings(
  wallet: string,
  settings: Partial<Omit<UserSettings, "wallet_address">>,
): Promise<UserSettings> {
  if (isMockModeEnabled() || !wallet || wallet === "0xdemo_user") {
    return { wallet_address: wallet, ...SETTINGS_DEFAULTS, ...settings };
  }
  const { data, error } = await supabase.functions.invoke("user-settings", {
    body: { wallet, ...settings },
  });
  if (error) throw error;
  return data as UserSettings;
}

// ── Market Pulse ──────────────────────────────────────────────────────────────

export async function getMarketPulse(): Promise<MarketPulseResponse> {
  const { data, error } = await supabase.functions.invoke("market-pulse");
  if (error) throw error;
  return data as MarketPulseResponse;
}

export async function getPairSnapshot(pair: string): Promise<PairSnapshot> {
  const { data, error } = await supabase.functions.invoke("market-pulse", {
    body: null,
    headers: {},
  });
  // Use GET with query param via fetch
  const url = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/market-pulse?pair=${encodeURIComponent(pair)}`;
  const res = await fetch(url, {
    headers: {
      apikey:        import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
      Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
    },
  });
  if (!res.ok) throw new Error(`market-pulse error: ${res.status}`);
  return (await res.json()) as PairSnapshot;
}

// ── Wallet History ────────────────────────────────────────────────────────────

export async function getWalletHistory(
  wallet: string,
  opts: { limit?: number; offset?: number } = {},
): Promise<WalletHistoryResponse> {
  const { limit = 20, offset = 0 } = opts;
  const params = new URLSearchParams({
    wallet,
    limit:  String(limit),
    offset: String(offset),
  });
  const url = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/wallet-history?${params}`;
  const res = await fetch(url, {
    headers: {
      apikey:        import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
      Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
    },
  });
  if (!res.ok) throw new Error(`wallet-history error: ${res.status}`);
  return (await res.json()) as WalletHistoryResponse;
}
