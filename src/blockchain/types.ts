/**
 * Blockchain types for the Risk Oracle on-chain integration.
 * These mirror Solidity structs and contract ABIs for frontend use.
 */

// ── On-Chain Risk Score (mirrors RiskOracle.sol struct) ──────────────────────

export interface OnChainRiskScore {
  safetyScore: number;      // 0–1000 (3 decimal precision)
  sandwichRisk: number;     // 0–1000
  liquidityRisk: number;    // 0–1000
  walletRisk: number;       // 0–1000
  volatilityRisk: number;   // 0–1000
  timestamp: number;        // Unix seconds
  swapInitiator: string;    // address
  tokenIn: string;          // address
  tokenOut: string;         // address
}

// ── Swap ID ──────────────────────────────────────────────────────────────────

export interface SwapParams {
  initiator: string;
  tokenIn: string;
  tokenOut: string;
  amountIn: string;         // wei string
  nonce: string;
  chainId: number;
}

// ── Signed Risk Response (from oracle feeder / edge function) ────────────────

export interface SignedRiskResponse {
  score: OnChainRiskScore;
  signature: string;        // EIP-191 signature from authorized feeder
  swapId: string;           // keccak256 hash
  verified: boolean;        // Whether on-chain verification passed
  feederId: string;         // Address of the signing feeder
}

// ── Oracle Feeder ────────────────────────────────────────────────────────────

export interface OracleFeederStatus {
  address: string;
  authorized: boolean;
  lastUpdate: number;       // Unix timestamp
  totalUpdates: number;
  avgLatencyMs: number;
}

// ── Oracle Metrics ───────────────────────────────────────────────────────────

export interface OracleMetrics {
  totalSwapsAssessed: number;
  avgSafetyScore: number;
  sandwichAttacksBlocked: number;
  tvlProtected: string;     // USD formatted
  uptime: number;           // 0–100 percentage
  feederLatencyMs: number;
  lastBlockProcessed: number;
  activeWallets24h: number;
}

// ── Risk Event (from on-chain event logs) ────────────────────────────────────

export interface RiskScoreEvent {
  swapId: string;
  score: OnChainRiskScore;
  blockNumber: number;
  transactionHash: string;
  logIndex: number;
}

// ── Contract Addresses ───────────────────────────────────────────────────────

export interface ContractAddresses {
  riskOracle: string;
  riskVerifier: string;
  riskRegistry: string;
}

// ── OneChain Network Config ──────────────────────────────────────────────────

export interface OneChainNetwork {
  name: string;
  chainId: number;
  rpcUrl: string;
  explorerUrl: string;
  contracts: ContractAddresses;
  isTestnet: boolean;
}

export const ONECHAIN_TESTNET: OneChainNetwork = {
  name: "OneChain Testnet",
  chainId: 1666700000,
  rpcUrl: "https://rpc-testnet.onechain.com",
  explorerUrl: "https://explorer-testnet.onechain.com",
  contracts: {
    riskOracle: "0x0000000000000000000000000000000000000000",   // Deploy placeholder
    riskVerifier: "0x0000000000000000000000000000000000000000",
    riskRegistry: "0x0000000000000000000000000000000000000000",
  },
  isTestnet: true,
};

export const ONECHAIN_MAINNET: OneChainNetwork = {
  name: "OneChain Mainnet",
  chainId: 1666600000,
  rpcUrl: "https://rpc-mainnet.onechain.com",
  explorerUrl: "https://explorer.onechain.com",
  contracts: {
    riskOracle: "0x0000000000000000000000000000000000000000",
    riskVerifier: "0x0000000000000000000000000000000000000000",
    riskRegistry: "0x0000000000000000000000000000000000000000",
  },
  isTestnet: false,
};

// ── Poker Risk Multiplier ────────────────────────────────────────────────────

export function getPokerRiskMultiplier(safetyScore: number): number {
  if (safetyScore >= 900) return 1.5;   // Safe trader bonus
  if (safetyScore >= 700) return 1.2;
  if (safetyScore < 400) return 0.5;    // High risk penalty
  return 1.0;
}

// ── Zero Gas Mode ────────────────────────────────────────────────────────────

export interface GaslessRiskRequest {
  initiator: string;
  tokenIn: string;
  tokenOut: string;
  amountIn: string;
  nonce: string;
  chainId: number;
  signature: string;        // OneWallet EIP-191 signature
}
