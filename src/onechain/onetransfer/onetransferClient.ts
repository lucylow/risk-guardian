/**
 * OneTransfer adapter — token routing and transfer path analysis.
 * Tries real OneTransfer API first, falls back to computed paths.
 */

import type { TransferPath } from "../types";
import { DEFAULT_CHAIN } from "@/config/chains";

const API_BASE = DEFAULT_CHAIN.apis.oneTransfer;

/** Attempt real OneTransfer API call */
async function fetchRealTransferPath(
  fromToken: string,
  toToken: string,
  amount: string,
): Promise<TransferPath | null> {
  try {
    const res = await fetch(`${API_BASE}/route`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({ fromToken, toToken, amount }),
      signal: AbortSignal.timeout(5000),
    });

    if (!res.ok) return null;

    const data = await res.json();
    return {
      hops: Number(data.hops ?? 1),
      containsBridge: Boolean(data.containsBridge ?? data.bridge),
      usesRWA: Boolean(data.usesRWA),
      estimatedTimeSeconds: Number(data.estimatedTime ?? data.estimatedTimeSeconds ?? 15),
      pathDescription: data.pathDescription ?? data.path ?? `${fromToken} → ${toToken}`,
    };
  } catch {
    return null;
  }
}

/** Get transfer path — real API first, computed fallback */
export async function getTransferPath(
  fromToken: string,
  toToken: string,
  amount: string,
): Promise<TransferPath> {
  // Try real API
  const real = await fetchRealTransferPath(fromToken, toToken, amount);
  if (real) return real;

  // Computed fallback
  const pair = `${fromToken}_${toToken}`.toUpperCase();
  const isComplex = pair.includes("BTC") || pair.includes("ETH");

  return {
    hops: isComplex ? 3 : 1,
    containsBridge: isComplex,
    usesRWA: false,
    estimatedTimeSeconds: isComplex ? 120 : 15,
    pathDescription: isComplex
      ? `${fromToken} → Bridge → WONE → ${toToken}`
      : `${fromToken} → ${toToken} (direct)`,
  };
}
