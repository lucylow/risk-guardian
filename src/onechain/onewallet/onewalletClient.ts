/**
 * OneWallet adapter — connects to OneWallet extension/mobile for auth & signing.
 * Docs: https://docs.onelabs.cc/DevelopmentDocument
 * App: https://apps.apple.com/qa/app/onewallet-onechain/id6749725541
 *
 * In demo/mock mode, returns simulated wallet context.
 */

import type { OneWalletContext } from "../types";

const ONECHAIN_MAINNET_ID = 1666600000;
const ONECHAIN_TESTNET_ID = 1666700000;

/** Check if OneWallet extension is injected */
export function isOneWalletAvailable(): boolean {
  return typeof window !== "undefined" && !!(window as any).oneWallet;
}

/** Get OneWallet context (mock in demo mode) */
export async function getOneWalletContext(
  mock = true
): Promise<OneWalletContext> {
  if (!mock && isOneWalletAvailable()) {
    // Real OneWallet integration — placeholder for SDK calls
    const provider = (window as any).oneWallet;
    try {
      const accounts = await provider.request({ method: "eth_requestAccounts" });
      const chainId = await provider.request({ method: "eth_chainId" });
      return {
        address: accounts[0],
        chainId: parseInt(chainId, 16),
        connected: true,
        zeroGasEligible: true,
      };
    } catch {
      return { address: "", chainId: 0, connected: false };
    }
  }

  // Mock context for demo
  return {
    address: "0x1234567890123456789012345678901234567890",
    chainId: ONECHAIN_MAINNET_ID,
    oneId: "riskoracle.one",
    usdoBalance: "2,450.00",
    octBalance: "15,320",
    zeroGasEligible: true,
    connected: true,
  };
}

/** Sign a message using OneWallet */
export async function signMessage(
  message: string,
  mock = true
): Promise<string> {
  if (!mock && isOneWalletAvailable()) {
    const provider = (window as any).oneWallet;
    const accounts = await provider.request({ method: "eth_requestAccounts" });
    return provider.request({
      method: "personal_sign",
      params: [message, accounts[0]],
    });
  }
  // Mock signature
  return `0xmock_signature_${btoa(message).slice(0, 20)}`;
}

export { ONECHAIN_MAINNET_ID, ONECHAIN_TESTNET_ID };
