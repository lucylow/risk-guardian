/**
 * OneWallet adapter — connects to OneWallet extension/mobile for auth & signing.
 * Docs: https://docs.onelabs.cc/DevelopmentDocument
 * App: https://apps.apple.com/qa/app/onewallet-onechain/id6749725541
 *
 * Tries real OneWallet injection first, falls back to demo context.
 */

import type { OneWalletContext } from "../types";
import { getBalance } from "@/lib/rpcProvider";

const ONECHAIN_MAINNET_ID = 1666600000;
const ONECHAIN_TESTNET_ID = 1666700000;

/** Check if OneWallet extension is injected */
export function isOneWalletAvailable(): boolean {
  return typeof window !== "undefined" && !!(window as any).oneWallet;
}

/** Check for any EIP-1193 provider (MetaMask, OneWallet, etc.) */
function getInjectedProvider(): any | null {
  if (typeof window === "undefined") return null;
  return (window as any).oneWallet ?? (window as any).ethereum ?? null;
}

/** Format wei hex to human-readable token amount */
function formatBalance(weiHex: string, decimals = 18): string {
  const wei = BigInt(weiHex);
  const whole = wei / BigInt(10 ** decimals);
  const frac = wei % BigInt(10 ** decimals);
  const fracStr = frac.toString().padStart(decimals, "0").slice(0, 2);
  return `${whole.toLocaleString()}.${fracStr}`;
}

/** Get OneWallet context — tries real wallet first */
export async function getOneWalletContext(
  mock = true,
): Promise<OneWalletContext> {
  const provider = getInjectedProvider();

  if (provider) {
    try {
      const accounts: string[] = await provider.request({ method: "eth_requestAccounts" });
      const chainIdHex: string = await provider.request({ method: "eth_chainId" });
      const chainId = parseInt(chainIdHex, 16);
      const address = accounts[0];

      // Try fetching real balance via RPC
      let formattedBalance = "0.00";
      try {
        const balHex = await getBalance(address);
        formattedBalance = formatBalance(balHex);
      } catch {
        // Balance fetch failed, continue without it
      }

      return {
        address,
        chainId,
        connected: true,
        zeroGasEligible: chainId === ONECHAIN_MAINNET_ID || chainId === ONECHAIN_TESTNET_ID,
        octBalance: formattedBalance,
      };
    } catch {
      // User rejected or error — fall through to demo context
    }
  }

  if (!mock) {
    return { address: "", chainId: 0, connected: false };
  }

  // Demo context
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

/** Sign a message using OneWallet or injected provider */
export async function signMessage(
  message: string,
  mock = true,
): Promise<string> {
  const provider = getInjectedProvider();

  if (provider) {
    try {
      const accounts: string[] = await provider.request({ method: "eth_requestAccounts" });
      return await provider.request({
        method: "personal_sign",
        params: [message, accounts[0]],
      });
    } catch {
      // Fall through to computed signature
    }
  }

  if (!mock) {
    throw new Error("No wallet provider available for signing");
  }

  // Computed signature for demo
  const buf = new TextEncoder().encode(message);
  const hash = await crypto.subtle.digest("SHA-256", buf);
  return "0x" + Array.from(new Uint8Array(hash))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export { ONECHAIN_MAINNET_ID, ONECHAIN_TESTNET_ID };
