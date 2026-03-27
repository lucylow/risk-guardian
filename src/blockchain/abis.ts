/**
 * RiskOracle contract ABI — subset used by frontend for reading scores and events.
 * Mirrors RiskOracle.sol deployed on OneChain.
 */

export const RISK_ORACLE_ABI = [
  // ── Read functions ────────────────────────────────────────────────────────
  {
    name: "swapRiskScores",
    type: "function",
    stateMutability: "view",
    inputs: [{ name: "swapId", type: "bytes32" }],
    outputs: [
      { name: "safetyScore", type: "uint256" },
      { name: "sandwichRisk", type: "uint256" },
      { name: "liquidityRisk", type: "uint256" },
      { name: "walletRisk", type: "uint256" },
      { name: "volatilityRisk", type: "uint256" },
      { name: "timestamp", type: "uint256" },
      { name: "swapInitiator", type: "address" },
      { name: "tokenIn", type: "address" },
      { name: "tokenOut", type: "address" },
    ],
  },
  {
    name: "walletRiskProfiles",
    type: "function",
    stateMutability: "view",
    inputs: [{ name: "wallet", type: "address" }],
    outputs: [{ name: "riskScore", type: "uint256" }],
  },
  {
    name: "authorizedFeeders",
    type: "function",
    stateMutability: "view",
    inputs: [{ name: "feeder", type: "address" }],
    outputs: [{ name: "isAuthorized", type: "bool" }],
  },

  // ── Events ────────────────────────────────────────────────────────────────
  {
    name: "RiskScoreUpdated",
    type: "event",
    inputs: [
      { name: "swapId", type: "bytes32", indexed: true },
      { name: "safetyScore", type: "uint256", indexed: false },
      { name: "sandwichRisk", type: "uint256", indexed: false },
      { name: "liquidityRisk", type: "uint256", indexed: false },
      { name: "walletRisk", type: "uint256", indexed: false },
      { name: "volatilityRisk", type: "uint256", indexed: false },
      { name: "timestamp", type: "uint256", indexed: false },
      { name: "swapInitiator", type: "address", indexed: true },
      { name: "tokenIn", type: "address", indexed: false },
      { name: "tokenOut", type: "address", indexed: false },
    ],
  },
  {
    name: "WalletRiskUpdated",
    type: "event",
    inputs: [
      { name: "wallet", type: "address", indexed: true },
      { name: "riskScore", type: "uint256", indexed: false },
    ],
  },
] as const;

export const RISK_VERIFIER_ABI = [
  {
    name: "verifyRiskSignature",
    type: "function",
    stateMutability: "view",
    inputs: [
      { name: "initiator", type: "address" },
      { name: "tokenIn", type: "address" },
      { name: "tokenOut", type: "address" },
      { name: "amountIn", type: "uint256" },
      { name: "safetyScore", type: "uint256" },
      { name: "timestamp", type: "uint256" },
      { name: "signature", type: "bytes" },
    ],
    outputs: [{ name: "isValid", type: "bool" }],
  },
  {
    name: "authorizedSigners",
    type: "function",
    stateMutability: "view",
    inputs: [{ name: "signer", type: "address" }],
    outputs: [{ name: "isAuthorized", type: "bool" }],
  },
] as const;
