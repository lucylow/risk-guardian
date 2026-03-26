/**
 * _shared/auth.ts — Edge-friendly auth helpers.
 *
 * In demo/hackathon mode, signature verification is mocked.
 * Swap in real EVM ecrecover when moving to production.
 */
import type { SwapRequest } from "./types.ts";
import { EDGE_CONFIG } from "./config.ts";

/**
 * Verify swap signature. In mock mode, always returns true.
 * TODO: Replace with real EVM signature verification (ethers.js verifyMessage or Web Crypto)
 */
export async function verifySwapSignature(
  _req: SwapRequest,
  _publicKeyHint?: string,
): Promise<boolean> {
  if (EDGE_CONFIG.USE_MOCK) return true;

  // Production implementation would go here:
  // 1. Reconstruct the message hash from swap params
  // 2. Recover the signer address from the signature
  // 3. Compare against req.userAddress
  // For now, always pass
  return true;
}

/**
 * Extract JWT from Authorization header (if present).
 * Returns null if no token. Does NOT validate — use Supabase client for that.
 */
export function extractBearerToken(req: Request): string | null {
  const auth = req.headers.get("authorization");
  if (!auth?.startsWith("Bearer ")) return null;
  return auth.slice(7).trim() || null;
}
