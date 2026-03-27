/**
 * useRiskOracle — React hook for on-chain risk oracle reads and verification.
 */

import { useState, useCallback } from "react";
import { assessSwapOnChain, verifyOnChain } from "@/blockchain/oracleClient";
import type { SignedRiskResponse, SwapParams } from "@/blockchain/types";
import { useOneWallet } from "./useOneWallet";

export interface UseRiskOracleReturn {
  result: SignedRiskResponse | null;
  isLoading: boolean;
  error: string | null;
  assess: (params: Omit<SwapParams, "initiator" | "chainId">) => Promise<SignedRiskResponse>;
  verify: () => Promise<boolean>;
  isVerified: boolean | null;
}

export function useRiskOracle(): UseRiskOracleReturn {
  const { address, chainId } = useOneWallet();
  const [result, setResult] = useState<SignedRiskResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isVerified, setIsVerified] = useState<boolean | null>(null);

  const assess = useCallback(
    async (params: Omit<SwapParams, "initiator" | "chainId">) => {
      setIsLoading(true);
      setError(null);
      setIsVerified(null);
      try {
        const fullParams: SwapParams = {
          ...params,
          initiator: address ?? "0x0000000000000000000000000000000000000000",
          chainId: chainId ?? 1666600000,
        };
        const res = await assessSwapOnChain(fullParams);
        setResult(res);
        return res;
      } catch (e) {
        const msg = e instanceof Error ? e.message : "Oracle assessment failed";
        setError(msg);
        throw e;
      } finally {
        setIsLoading(false);
      }
    },
    [address, chainId],
  );

  const verify = useCallback(async () => {
    if (!result) return false;
    const valid = await verifyOnChain(result.swapId, result.score, result.signature);
    setIsVerified(valid);
    return valid;
  }, [result]);

  return { result, isLoading, error, assess, verify, isVerified };
}
