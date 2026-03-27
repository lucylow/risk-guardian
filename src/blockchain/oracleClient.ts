/**
 * Mock oracle client — simulates on-chain oracle reads and signature verification.
 * In production, these would use ethers.js / viem to interact with deployed contracts.
 */

import type {
  OnChainRiskScore,
  SignedRiskResponse,
  SwapParams,
  OracleMetrics,
  RiskScoreEvent,
  OracleFeederStatus,
} from "./types";

// ── Swap ID computation (mirrors Solidity keccak256) ─────────────────────────

export function computeSwapId(params: SwapParams): string {
  // In production: ethers.solidityPackedKeccak256(...)
  const raw = `${params.initiator}:${params.tokenIn}:${params.tokenOut}:${params.amountIn}:${params.nonce}`;
  return `0x${Array.from(new TextEncoder().encode(raw))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("")
    .slice(0, 64)
    .padEnd(64, "0")}`;
}

// ── Mock signature generation ────────────────────────────────────────────────

function mockSignature(score: OnChainRiskScore): string {
  const payload = `${score.safetyScore}:${score.timestamp}:${score.swapInitiator}`;
  return `0xmock_sig_${btoa(payload).slice(0, 40)}`;
}

// ── Risk scoring (0–1000 scale, mirrors Solidity precision) ──────────────────

function computeMockOnChainScore(params: SwapParams): OnChainRiskScore {
  const tokenPair = `${params.tokenIn}_${params.tokenOut}`.toUpperCase();
  const amount = parseFloat(params.amountIn) / 1e18 || 500;

  let sandwich = tokenPair.includes("HIGHRISK") ? 700 : tokenPair.includes("BTC") ? 450 : 150;
  let liquidity = tokenPair.includes("HIGHRISK") ? 300 : tokenPair.includes("BTC") ? 650 : 900;
  const wallet = params.initiator.endsWith("dead") ? 650 : 100;
  const volatility = tokenPair.includes("HIGHRISK") ? 600 : tokenPair.includes("BTC") ? 350 : 120;

  // Amount scaling
  sandwich = Math.min(1000, sandwich + Math.min(Math.floor(amount / 50), 200));
  liquidity = Math.max(0, liquidity - Math.min(Math.floor(amount / 100), 150));

  const riskScore = 0.4 * sandwich + 0.3 * (1000 - liquidity) + 0.2 * wallet + 0.1 * volatility;
  const safety = Math.max(0, Math.min(1000, Math.round(1000 - riskScore)));

  return {
    safetyScore: safety,
    sandwichRisk: sandwich,
    liquidityRisk: 1000 - liquidity,
    walletRisk: wallet,
    volatilityRisk: volatility,
    timestamp: Math.floor(Date.now() / 1000),
    swapInitiator: params.initiator,
    tokenIn: params.tokenIn,
    tokenOut: params.tokenOut,
  };
}

// ── Public API ───────────────────────────────────────────────────────────────

/** Simulate full oracle assessment: compute + sign + verify */
export async function assessSwapOnChain(params: SwapParams): Promise<SignedRiskResponse> {
  await new Promise((r) => setTimeout(r, 200 + Math.random() * 300));

  const score = computeMockOnChainScore(params);
  const swapId = computeSwapId(params);
  const signature = mockSignature(score);

  return {
    score,
    signature,
    swapId,
    verified: true,
    feederId: "0xFEEDER_MOCK_0001",
  };
}

/** Simulate verifying a signature on-chain */
export async function verifyOnChain(
  _swapId: string,
  _score: OnChainRiskScore,
  _signature: string,
): Promise<boolean> {
  await new Promise((r) => setTimeout(r, 80));
  return true; // Mock always passes
}

/** Read an on-chain score by swap ID */
export async function readOnChainScore(swapId: string): Promise<OnChainRiskScore | null> {
  await new Promise((r) => setTimeout(r, 50));
  // Mock: return a random-ish score keyed by the swap ID
  const seed = swapId.charCodeAt(4) % 10;
  return {
    safetyScore: 600 + seed * 40,
    sandwichRisk: 100 + seed * 30,
    liquidityRisk: 200 + seed * 20,
    walletRisk: 80 + seed * 15,
    volatilityRisk: 150 + seed * 25,
    timestamp: Math.floor(Date.now() / 1000) - seed * 60,
    swapInitiator: "0x1234567890123456789012345678901234567890",
    tokenIn: "ONE",
    tokenOut: "USDC",
  };
}

/** Get oracle metrics */
export async function getOracleMetrics(): Promise<OracleMetrics> {
  await new Promise((r) => setTimeout(r, 100));
  return {
    totalSwapsAssessed: 14_832,
    avgSafetyScore: 724,
    sandwichAttacksBlocked: 342,
    tvlProtected: "$2.4M",
    uptime: 99.97,
    feederLatencyMs: 127,
    lastBlockProcessed: 8_421_093,
    activeWallets24h: 1_247,
  };
}

/** Get oracle feeder status */
export async function getFeederStatus(): Promise<OracleFeederStatus[]> {
  await new Promise((r) => setTimeout(r, 60));
  return [
    {
      address: "0xFEEDER_MOCK_0001",
      authorized: true,
      lastUpdate: Math.floor(Date.now() / 1000) - 12,
      totalUpdates: 9_421,
      avgLatencyMs: 127,
    },
    {
      address: "0xFEEDER_MOCK_0002",
      authorized: true,
      lastUpdate: Math.floor(Date.now() / 1000) - 45,
      totalUpdates: 5_410,
      avgLatencyMs: 198,
    },
  ];
}

/** Simulate subscribing to on-chain risk events */
export function subscribeToRiskEvents(
  onEvent: (event: RiskScoreEvent) => void,
): () => void {
  const pairs = [
    ["ONE", "USDC"],
    ["ONE", "BTC"],
    ["OCT", "USDO"],
    ["HIGHRISK", "USDC"],
  ];

  const interval = setInterval(() => {
    const [tIn, tOut] = pairs[Math.floor(Math.random() * pairs.length)];
    const safety = 400 + Math.floor(Math.random() * 600);
    onEvent({
      swapId: `0x${Math.random().toString(16).slice(2, 18).padEnd(64, "0")}`,
      score: {
        safetyScore: safety,
        sandwichRisk: Math.floor(Math.random() * 500),
        liquidityRisk: Math.floor(Math.random() * 400),
        walletRisk: Math.floor(Math.random() * 300),
        volatilityRisk: Math.floor(Math.random() * 400),
        timestamp: Math.floor(Date.now() / 1000),
        swapInitiator: `0x${Math.random().toString(16).slice(2, 42)}`,
        tokenIn: tIn,
        tokenOut: tOut,
      },
      blockNumber: 8_421_000 + Math.floor(Math.random() * 1000),
      transactionHash: `0x${Math.random().toString(16).slice(2, 66)}`,
      logIndex: Math.floor(Math.random() * 10),
    });
  }, 3000 + Math.random() * 4000);

  return () => clearInterval(interval);
}
