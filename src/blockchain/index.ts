/**
 * Blockchain layer — barrel export.
 */
export * from "./types";
export * from "./abis";
export {
  computeSwapId,
  assessSwapOnChain,
  verifyOnChain,
  readOnChainScore,
  getOracleMetrics,
  getFeederStatus,
  subscribeToRiskEvents,
} from "./oracleClient";
