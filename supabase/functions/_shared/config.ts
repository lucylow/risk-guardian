/**
 * _shared/config.ts — Environment config for all edge functions.
 *
 * Required env vars for production:
 *   SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, LOVABLE_API_KEY
 *
 * Optional env vars:
 *   RISK_USE_MOCK       — "true" (default) to use mock risk engine
 *   RISK_RATE_LIMIT     — requests per minute per key (default: 60)
 *   RISK_LOG_LEVEL      — "debug" | "info" | "warn" | "error" (default: "info")
 *   NODE_ENV             — "development" | "production"
 */

function getEnv(key: string, fallback: string): string {
  try {
    return Deno.env.get(key) ?? fallback;
  } catch {
    return fallback;
  }
}

export const EDGE_CONFIG = {
  ENV: getEnv("NODE_ENV", "development"),
  USE_MOCK: getEnv("RISK_USE_MOCK", "true") === "true",
  RATE_LIMIT_PER_MIN: Number(getEnv("RISK_RATE_LIMIT", "60")),
  LOG_LEVEL: getEnv("RISK_LOG_LEVEL", "info") as "debug" | "info" | "warn" | "error",
  VERSION: "2.2.0",
  SUPABASE_URL: getEnv("SUPABASE_URL", ""),
  SUPABASE_SERVICE_ROLE_KEY: getEnv("SUPABASE_SERVICE_ROLE_KEY", ""),
  LOVABLE_API_KEY: getEnv("LOVABLE_API_KEY", ""),
} as const;

export function isProd(): boolean {
  return EDGE_CONFIG.ENV === "production";
}
