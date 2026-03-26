/**
 * OneRWA adapter — Real-World Asset exposure for risk scoring.
 */

import type { RwaExposure } from "../types";

export async function getRwaExposure(address: string): Promise<RwaExposure> {
  await new Promise((r) => setTimeout(r, 60));

  // Mock: some addresses have RWA holdings
  if (address.startsWith("0x1234")) {
    return {
      totalUsd: 45_000,
      collateralized: true,
      diversificationIndex: 72,
      assets: [
        { name: "US Treasury Bond Token", valueUsd: 25_000, type: "bond" },
        { name: "Real Estate Index", valueUsd: 15_000, type: "real_estate" },
        { name: "Gold-Backed Token", valueUsd: 5_000, type: "commodity" },
      ],
    };
  }

  return {
    totalUsd: 0,
    collateralized: false,
    diversificationIndex: 0,
    assets: [],
  };
}
