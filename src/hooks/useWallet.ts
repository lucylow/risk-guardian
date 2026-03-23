import { useState, useEffect } from "react";

export function useWallet() {
  const [address, setAddress] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    // Demo: simulate a connected wallet
    setAddress("0x1234567890123456789012345678901234567890");
    setIsConnected(true);
  }, []);

  const connect = () => {
    setAddress("0x1234567890123456789012345678901234567890");
    setIsConnected(true);
  };

  const disconnect = () => {
    setAddress(null);
    setIsConnected(false);
  };

  const shortAddress = address
    ? `${address.slice(0, 6)}…${address.slice(-4)}`
    : null;

  return { address, isConnected, connect, disconnect, shortAddress };
}
