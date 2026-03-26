/**
 * _shared/validate.ts — Input validation for edge functions.
 * Lightweight, no external deps. Edge-friendly.
 */
import type { SwapRequest, SettingsPayload } from "./types.ts";
import { ValidationError } from "./http.ts";

const HEX_ADDRESS = /^0x[a-fA-F0-9]{40}$/;
const MAX_AMOUNT = 1_000_000_000;

/** Validate & normalize a swap/assess request body */
export function validateSwapRequest(body: unknown): SwapRequest {
  if (!body || typeof body !== "object") throw new ValidationError("Body must be a JSON object");
  const b = body as Record<string, unknown>;

  // Support both new (tokenIn/tokenOut) and legacy (pair) formats
  let tokenIn: string;
  let tokenOut: string;

  if (typeof b.pair === "string" && b.pair.includes("_")) {
    const parts = b.pair.trim().toUpperCase().split("_");
    tokenIn = parts[0];
    tokenOut = parts[1];
  } else {
    tokenIn = typeof b.tokenIn === "string" ? b.tokenIn.trim().toUpperCase() : "";
    tokenOut = typeof b.tokenOut === "string" ? b.tokenOut.trim().toUpperCase() : "";
  }
  if (!tokenIn) tokenIn = "ONE";
  if (!tokenOut) tokenOut = "USDC";

  const amountIn = Number(b.amountIn ?? b.amount ?? 0);
  if (isNaN(amountIn) || amountIn <= 0) throw new ValidationError("amountIn must be a positive number");
  if (amountIn > MAX_AMOUNT) throw new ValidationError("amountIn exceeds maximum allowed value");

  const userAddress = typeof (b.userAddress ?? b.user_address) === "string"
    ? String(b.userAddress ?? b.user_address).trim()
    : "0xdemo";

  const wallet = typeof b.wallet === "string" ? b.wallet.trim() : "normal";

  return {
    userAddress,
    tokenIn,
    tokenOut,
    amountIn,
    wallet,
    pair: `${tokenIn}_${tokenOut}`,
    signature: typeof b.signature === "string" ? b.signature : undefined,
    nonce: typeof b.nonce === "string" ? b.nonce : undefined,
  };
}

/** Validate a wallet/address string (permissive for demo) */
export function validateAddress(raw: unknown): string {
  if (typeof raw !== "string" || !raw.trim()) throw new ValidationError("address is required");
  const addr = raw.trim().toLowerCase();
  if (addr.length > 100) throw new ValidationError("address too long");
  return addr;
}

/** Validate settings update payload */
export function validateSettingsPayload(body: unknown): SettingsPayload {
  if (!body || typeof body !== "object") throw new ValidationError("Body must be a JSON object");
  const b = body as Record<string, unknown>;

  const wallet = validateAddress(b.wallet);
  const out: SettingsPayload = { wallet };

  if (typeof b.auto_protect_enabled === "boolean") out.auto_protect_enabled = b.auto_protect_enabled;
  if (typeof b.auto_adjust_slippage === "boolean") out.auto_adjust_slippage = b.auto_adjust_slippage;
  if (typeof b.notify_on_high_risk === "boolean") out.notify_on_high_risk = b.notify_on_high_risk;
  if (typeof b.risk_threshold === "number") {
    const t = Math.round(b.risk_threshold);
    if (t >= 0 && t <= 100) out.risk_threshold = t;
  }

  const keys = Object.keys(out).filter((k) => k !== "wallet");
  if (keys.length === 0) throw new ValidationError("No valid settings fields provided");

  return out;
}

/** Validate pagination params */
export function validatePagination(params: URLSearchParams): { limit: number; offset: number; ascending: boolean } {
  return {
    limit: Math.min(100, Math.max(1, Number(params.get("limit") ?? 20))),
    offset: Math.max(0, Number(params.get("offset") ?? 0)),
    ascending: params.get("order") === "asc",
  };
}
