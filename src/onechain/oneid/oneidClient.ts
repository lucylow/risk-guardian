/**
 * OneID adapter — cross-chain DID + wallet reputation.
 * Docs: https://docs.oneid.xyz/developers-guide/oneid-sdk
 *
 * Resolves wallet addresses to OneID profiles and reputation data.
 * In demo mode, returns deterministic mock profiles.
 */

import type { OneIdProfile } from "../types";

const KNOWN_PROFILES: Record<string, Partial<OneIdProfile>> = {
  "0x1234567890123456789012345678901234567890": {
    id: "riskoracle.one",
    displayName: "Risk Oracle Demo",
    reputationTier: "veteran",
    crossChainActivity: 85,
    riskFlags: [],
    linkedWallets: [
      { chain: "OneChain", address: "0x1234…7890" },
      { chain: "Ethereum", address: "0xabcd…ef01" },
      { chain: "BSC", address: "0x5678…9abc" },
    ],
  },
  suspicious: {
    id: "anon_flagged.one",
    displayName: "Anonymous",
    reputationTier: "flagged",
    crossChainActivity: 12,
    riskFlags: ["wash_trading", "flash_loan_abuse"],
    linkedWallets: [{ chain: "OneChain", address: "0xdead…beef" }],
  },
};

/** Resolve a wallet address to its OneID profile */
export async function resolveOneIdForWallet(
  address: string,
  _chainId?: number
): Promise<OneIdProfile | null> {
  // In a real integration, this would call the OneID Core SDK:
  // const oneId = new OneIdCore({ apiKey: '...' });
  // return oneId.resolve(address);

  await new Promise((r) => setTimeout(r, 150)); // simulate latency

  const known = KNOWN_PROFILES[address.toLowerCase()] ?? KNOWN_PROFILES[address];
  if (known) {
    return {
      id: known.id!,
      displayName: known.displayName!,
      linkedWallets: known.linkedWallets ?? [],
      reputationTier: known.reputationTier ?? "new",
      riskFlags: known.riskFlags ?? [],
      createdAt: "2024-03-15T10:00:00Z",
      crossChainActivity: known.crossChainActivity ?? 0,
    };
  }

  // Default for unknown wallets
  return {
    id: `${address.slice(0, 8)}…${address.slice(-4)}.one`,
    displayName: "OneChain User",
    linkedWallets: [{ chain: "OneChain", address }],
    reputationTier: "new",
    riskFlags: [],
    createdAt: new Date().toISOString(),
    crossChainActivity: 20,
  };
}

/** Get a risk multiplier from reputation tier */
export function reputationRiskMultiplier(tier: OneIdProfile["reputationTier"]): number {
  switch (tier) {
    case "veteran": return 0.7;
    case "active":  return 0.9;
    case "new":     return 1.1;
    case "flagged": return 1.5;
  }
}
