/**
 * useOneWallet — React hook for OneWallet connection, signing, and context.
 * Wraps the OneWallet adapter with React state management.
 */

import { useState, useEffect, useCallback } from "react";
import { getOneWalletContext, signMessage, isOneWalletAvailable } from "@/onechain/onewallet/onewalletClient";
import { resolveOneIdForWallet } from "@/onechain/oneid/oneidClient";
import { getGamificationProfile } from "@/onechain/oneplay/oneplayClient";
import type { OneWalletContext, OneIdProfile, GamificationProfile } from "@/onechain/types";
import { isMockModeEnabled } from "@/lib/mockMode";

export interface UseOneWalletReturn {
  // Wallet
  address: string | null;
  shortAddress: string | null;
  isConnected: boolean;
  chainId: number | null;
  usdoBalance: string | null;
  octBalance: string | null;
  zeroGasEligible: boolean;

  // OneID
  oneId: OneIdProfile | null;

  // GameFi
  gamification: GamificationProfile | null;

  // Actions
  connect: () => Promise<void>;
  disconnect: () => void;
  sign: (message: string) => Promise<string>;

  // Meta
  isLoading: boolean;
  isOneWalletInstalled: boolean;
}

export function useOneWallet(): UseOneWalletReturn {
  const [wallet, setWallet] = useState<OneWalletContext | null>(null);
  const [oneId, setOneId] = useState<OneIdProfile | null>(null);
  const [gamification, setGamification] = useState<GamificationProfile | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const mock = isMockModeEnabled();

  const connect = useCallback(async () => {
    setIsLoading(true);
    try {
      const ctx = await getOneWalletContext(mock);
      setWallet(ctx);

      if (ctx.connected && ctx.address) {
        const [id, gam] = await Promise.all([
          resolveOneIdForWallet(ctx.address, ctx.chainId),
          getGamificationProfile(ctx.address),
        ]);
        setOneId(id);
        setGamification(gam);
      }
    } finally {
      setIsLoading(false);
    }
  }, [mock]);

  const disconnect = useCallback(() => {
    setWallet(null);
    setOneId(null);
    setGamification(null);
  }, []);

  const sign = useCallback(async (message: string) => {
    return signMessage(message, mock);
  }, [mock]);

  // Auto-connect in demo mode
  useEffect(() => {
    if (mock) {
      connect();
    }
  }, [mock, connect]);

  const address = wallet?.address ?? null;

  return {
    address,
    shortAddress: address ? `${address.slice(0, 6)}…${address.slice(-4)}` : null,
    isConnected: wallet?.connected ?? false,
    chainId: wallet?.chainId ?? null,
    usdoBalance: wallet?.usdoBalance ?? null,
    octBalance: wallet?.octBalance ?? null,
    zeroGasEligible: wallet?.zeroGasEligible ?? false,
    oneId,
    gamification,
    connect,
    disconnect,
    sign,
    isLoading,
    isOneWalletInstalled: isOneWalletAvailable(),
  };
}
