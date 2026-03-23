export interface MockSwapScenario {
  tokenIn: string;
  tokenOut: string;
  amount: number;
  safetyScore: number;
  sandwichRisk: number;
  liquidityHealth: number;
  walletRisk: number;
  explanation: string;
  recommendation: string;
}

export const mockScenarios: MockSwapScenario[] = [
  {
    tokenIn: "ONE",
    tokenOut: "USDC",
    amount: 100,
    safetyScore: 92,
    sandwichRisk: 5,
    liquidityHealth: 95,
    walletRisk: 10,
    explanation:
      "Sandwich risk is low. Pool is healthy with deep liquidity. Wallet reputation is good.",
    recommendation: "Low risk - safe to swap.",
  },
  {
    tokenIn: "ONE",
    tokenOut: "BTC",
    amount: 1000,
    safetyScore: 78,
    sandwichRisk: 12,
    liquidityHealth: 88,
    walletRisk: 15,
    explanation:
      "Moderate sandwich risk. Pool health is good but watch for volatility.",
    recommendation:
      "Proceed with caution. Consider increasing slippage tolerance.",
  },
  {
    tokenIn: "SHIT",
    tokenOut: "USDC",
    amount: 500,
    safetyScore: 25,
    sandwichRisk: 65,
    liquidityHealth: 30,
    walletRisk: 45,
    explanation:
      "High sandwich attack probability. Liquidity pool is shallow. Wallet has limited history.",
    recommendation: "Do NOT proceed - extremely high risk.",
  },
  {
    tokenIn: "ONE",
    tokenOut: "USDC",
    amount: 5000,
    safetyScore: 55,
    sandwichRisk: 45,
    liquidityHealth: 70,
    walletRisk: 20,
    explanation:
      "Large amount increases sandwich risk. Pool health is moderate.",
    recommendation: "Reduce amount to lower risk.",
  },
];

interface MockRiskResult {
  safetyScore: number;
  sandwichRisk: number;
  liquidityHealth: number;
  walletRisk: number;
  explanation: string;
  recommendation: string;
}

export function getMockRisk(
  tokenIn: string,
  tokenOut: string,
  amount: number,
): MockRiskResult {
  const scenario = mockScenarios.find(
    (s) =>
      s.tokenIn === tokenIn &&
      s.tokenOut === tokenOut &&
      Math.abs(s.amount - amount) < 100,
  );
  if (scenario) return scenario;

  return {
    safetyScore: 50,
    sandwichRisk: 30,
    liquidityHealth: 50,
    walletRisk: 30,
    explanation: "This is a mock response for demo purposes.",
    recommendation: "Connect to a real backend for accurate scores.",
  };
}
