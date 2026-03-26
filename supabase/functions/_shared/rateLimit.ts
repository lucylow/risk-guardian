/**
 * _shared/rateLimit.ts — In-memory sliding-window rate limiter for edge.
 *
 * Note: In serverless edge, each isolate has its own memory, so this is
 * best-effort. For strict enforcement, use an external store (KV/Redis).
 */
import { EDGE_CONFIG } from "./config.ts";

interface Bucket {
  count: number;
  resetAt: number;
}

const buckets = new Map<string, Bucket>();

// Cleanup stale buckets every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [key, bucket] of buckets) {
    if (bucket.resetAt < now) buckets.delete(key);
  }
}, 5 * 60 * 1000);

export function checkRateLimit(
  key: string,
  limitPerMinute: number = EDGE_CONFIG.RATE_LIMIT_PER_MIN,
): { allowed: boolean; remaining: number; resetSeconds: number } {
  const now = Date.now();
  let bucket = buckets.get(key);

  if (!bucket || bucket.resetAt < now) {
    bucket = { count: 0, resetAt: now + 60_000 };
    buckets.set(key, bucket);
  }

  bucket.count++;
  const remaining = Math.max(0, limitPerMinute - bucket.count);
  const resetSeconds = Math.ceil((bucket.resetAt - now) / 1000);

  return {
    allowed: bucket.count <= limitPerMinute,
    remaining,
    resetSeconds,
  };
}
