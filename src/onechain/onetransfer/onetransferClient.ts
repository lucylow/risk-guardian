/**
 * OneTransfer adapter — token routing and transfer path analysis.
 */

import type { TransferPath } from "../types";

export async function getTransferPath(
  fromToken: string,
  toToken: string,
  _amount: string
): Promise<TransferPath> {
  await new Promise((r) => setTimeout(r, 60));

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
