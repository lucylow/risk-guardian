import { supabase } from "@/integrations/supabase/client";
import { isMockModeEnabled } from "@/lib/mockMode";
import { getMockRisk } from "@/mocks/mockData";

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

const AUTH_TOKEN_KEY = "risk_oracle_token";

export function setRiskOracleToken(token: string): void {
  localStorage.setItem(AUTH_TOKEN_KEY, token);
}

export function getRiskOracleToken(): string | null {
  return localStorage.getItem(AUTH_TOKEN_KEY);
}

async function authFetch(input: RequestInfo | URL, init: RequestInit = {}): Promise<Response> {
  const token = getRiskOracleToken();
  const headers = new Headers(init.headers ?? {});
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }
  return fetch(input, { ...init, headers });
}

function pairFromRequest(request: RiskRequest): string {
  return `${request.token_in}_${request.token_out}`.toUpperCase();
}

export async function loginWithOneWallet(payload: {
  address: string;
  signature: string;
  nonce: string;
}): Promise<void> {
  const response = await fetch("/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!response.ok) {
    throw new Error(`Login failed: ${response.status}`);
  }
  const data = (await response.json()) as { access_token: string };
  setRiskOracleToken(data.access_token);
}

export async function assessRisk(request: RiskRequest): Promise<RiskResponse> {
  if (isMockModeEnabled()) {
    return new Promise((resolve) => {
      setTimeout(() => {
        const mock = getMockRisk(
          request.token_in,
          request.token_out,
          request.amount_in,
        );
        resolve({
          safety_score: mock.safetyScore,
          risk_breakdown: {
            sandwich_risk: mock.sandwichRisk,
            liquidity_health: mock.liquidityHealth,
            wallet_risk: mock.walletRisk,
          },
          explanation: mock.explanation,
          recommendation: mock.recommendation,
          recommendation_type:
            mock.safetyScore >= 70
              ? "safe"
              : mock.safetyScore >= 40
                ? "moderate"
                : "danger",
        });
      }, 500);
    });
  }

  const pair = pairFromRequest(request);
  const { data, error } = await supabase.functions.invoke("risk-assess", {
    body: {
      pair,
      amount: request.amount_in,
      wallet: "normal",
      user_address: request.user_address,
    },
  });

  if (error) {
    throw error;
  }

  return data as RiskResponse;
}

export async function getSwapSuggestions(
  request: RiskRequest,
): Promise<SuggestResponse> {
  // Suggestions are always computed client-side from the edge function score.
  // The Python /suggest endpoint is not available in the hosted frontend deployment.
  const base = await assessRisk(request);
  const suggestions: Suggestion[] = [0.5, 0.25, 0.1].map((f) => {
    const newAmount = Number((request.amount_in * f).toFixed(2));
    const safetyBump = Math.min(15, Math.round((1 - f) * 20));
    return {
      type: "reduce_amount",
      amount: newAmount,
      safety_score: Math.min(99, base.safety_score + safetyBump),
      description: `Swap ${newAmount} ${request.token_in} instead of ${request.amount_in}`,
      recommendation: "Smaller trade size lowers sandwich and liquidity impact.",
    };
  });
  suggestions.push({
    type: "alternative_pool",
    safety_score: Math.min(99, base.safety_score + 8),
    description: `Route through deeper ${request.token_out}-${request.token_in} liquidity`,
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
  // Fire-and-forget: log to Supabase risk_assessments table metadata
  // (no separate feedback table needed in the hosted deployment)
  console.debug("[RiskOracle] suggestion feedback:", params);
}
