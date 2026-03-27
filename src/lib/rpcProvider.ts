/**
 * RPC provider utilities for OneChain.
 * Provides JSON-RPC call helpers without requiring ethers.js as a dependency.
 * Uses native fetch for lightweight on-chain reads.
 */

import { DEFAULT_CHAIN, type ChainConfig } from "@/config/chains";

let requestId = 1;

export interface JsonRpcResponse<T = unknown> {
  jsonrpc: string;
  id: number;
  result?: T;
  error?: { code: number; message: string };
}

/**
 * Make a JSON-RPC call to the OneChain RPC endpoint.
 * Tries primary URL first, then fallbacks.
 */
export async function rpcCall<T = unknown>(
  method: string,
  params: unknown[] = [],
  chain: ChainConfig = DEFAULT_CHAIN,
): Promise<T> {
  const urls = [chain.rpcUrl, ...chain.rpcFallbacks];
  let lastError: Error | null = null;

  for (const url of urls) {
    try {
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jsonrpc: "2.0",
          id: requestId++,
          method,
          params,
        }),
        signal: AbortSignal.timeout(8000),
      });

      if (!res.ok) {
        lastError = new Error(`RPC HTTP ${res.status}`);
        continue;
      }

      const json = (await res.json()) as JsonRpcResponse<T>;
      if (json.error) {
        lastError = new Error(`RPC Error: ${json.error.message}`);
        continue;
      }

      return json.result as T;
    } catch (e) {
      lastError = e instanceof Error ? e : new Error(String(e));
    }
  }

  throw lastError ?? new Error("All RPC endpoints failed");
}

/** Get latest block number */
export async function getBlockNumber(chain?: ChainConfig): Promise<number> {
  const hex = await rpcCall<string>("eth_blockNumber", [], chain);
  return parseInt(hex, 16);
}

/** Get balance of an address (in wei hex) */
export async function getBalance(address: string, chain?: ChainConfig): Promise<string> {
  return rpcCall<string>("eth_getBalance", [address, "latest"], chain);
}

/** Get chain ID */
export async function getChainId(chain?: ChainConfig): Promise<number> {
  const hex = await rpcCall<string>("eth_chainId", [], chain);
  return parseInt(hex, 16);
}

/** Call a contract read function (eth_call) */
export async function contractCall(
  to: string,
  data: string,
  chain?: ChainConfig,
): Promise<string> {
  return rpcCall<string>("eth_call", [{ to, data }, "latest"], chain);
}

/** Check if RPC is reachable */
export async function isRpcAvailable(chain: ChainConfig = DEFAULT_CHAIN): Promise<boolean> {
  try {
    await getChainId(chain);
    return true;
  } catch {
    return false;
  }
}
