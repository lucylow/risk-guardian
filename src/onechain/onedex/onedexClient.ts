/**
 * OneDEX adapter — swap pool data and liquidity health.
 * Provides pool reserves, TVL, LP concentration for risk scoring.
 */

import type { PoolHealth } from "../types";

const MOCK_POOLS: Record<string, PoolHealth> = {
  ONE_USDC: {
    poolAddress: "0xpool_one_usdc",
    tokenInReserve: "12,500,000",
    tokenOutReserve: "4,200,000",
    tvlUsd: 16_700_000,
    feeBps: 30,
    lpConcentrationIndex: 22,
    volume24hUsd: 3_400_000,
  },
  ONE_BTC: {
    poolAddress: "0xpool_one_btc",
    tokenInReserve: "8,000,000",
    tokenOutReserve: "120",
    tvlUsd: 8_200_000,
    feeBps: 50,
    lpConcentrationIndex: 45,
    volume24hUsd: 1_200_000,
  },
  ONE_ETH: {
    poolAddress: "0xpool_one_eth",
    tokenInReserve: "6,000,000",
    tokenOutReserve: "2,100",
    tvlUsd: 6_500_000,
    feeBps: 30,
    lpConcentrationIndex: 35,
    volume24hUsd: 2_100_000,
  },
  USDC_ONE: {
    poolAddress: "0xpool_usdc_one",
    tokenInReserve: "4,200,000",
    tokenOutReserve: "12,500,000",
    tvlUsd: 16_700_000,
    feeBps: 30,
    lpConcentrationIndex: 22,
    volume24hUsd: 3_400_000,
  },
  HIGH_RISK_PAIR: {
    poolAddress: "0xpool_shit_usdc",
    tokenInReserve: "50,000",
    tokenOutReserve: "12,000",
    tvlUsd: 62_000,
    feeBps: 100,
    lpConcentrationIndex: 88,
    volume24hUsd: 15_000,
  },
};

/** Get pool health for a trading pair */
export async function getPoolHealth(
  tokenIn: string,
  tokenOut: string
): Promise<PoolHealth> {
  await new Promise((r) => setTimeout(r, 100));

  const pair = `${tokenIn}_${tokenOut}`.toUpperCase();
  return (
    MOCK_POOLS[pair] ?? {
      poolAddress: `0xpool_${pair.toLowerCase()}`,
      tokenInReserve: "1,000,000",
      tokenOutReserve: "500,000",
      tvlUsd: 1_500_000,
      feeBps: 30,
      lpConcentrationIndex: 50,
      volume24hUsd: 200_000,
    }
  );
}
