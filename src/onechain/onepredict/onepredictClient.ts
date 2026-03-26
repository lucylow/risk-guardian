/**
 * OnePredict adapter — volatility forecasts and risk indices.
 * Integrates AI-driven market predictions into risk scoring.
 */

import type { VolatilityForecast } from "../types";

const PAIR_VOLATILITY: Record<string, Partial<VolatilityForecast>> = {
  ONE_USDC:       { volatilityIndex: 18, trend: "stable", confidence: 0.92 },
  ONE_BTC:        { volatilityIndex: 45, trend: "up",     confidence: 0.78 },
  ONE_ETH:        { volatilityIndex: 38, trend: "stable", confidence: 0.82 },
  USDC_ONE:       { volatilityIndex: 18, trend: "stable", confidence: 0.92 },
  HIGH_RISK_PAIR: { volatilityIndex: 82, trend: "down",   confidence: 0.55 },
};

/** Get a volatility forecast for a trading pair */
export async function getVolatilityForecast(
  tokenIn: string,
  tokenOut: string,
  horizonMinutes = 60
): Promise<VolatilityForecast> {
  await new Promise((r) => setTimeout(r, 80));

  const pair = `${tokenIn}_${tokenOut}`.toUpperCase();
  const base = PAIR_VOLATILITY[pair] ?? { volatilityIndex: 50, trend: "stable" as const, confidence: 0.7 };

  return {
    pair,
    horizonMinutes,
    volatilityIndex: base.volatilityIndex!,
    trend: base.trend as "up" | "down" | "stable",
    confidence: base.confidence!,
  };
}

/** Classify volatility level for display */
export function volatilityLabel(index: number): "Low" | "Medium" | "High" {
  if (index <= 30) return "Low";
  if (index <= 60) return "Medium";
  return "High";
}
