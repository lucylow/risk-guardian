/**
 * health — Lightweight health check endpoint for uptime monitoring.
 *
 * GET / → { status, env, useMock, version, uptime }
 * No auth, no rate limit.
 */
import { EDGE_CONFIG, isProd } from "../_shared/config.ts";
import { optionsResponse, jsonResponse } from "../_shared/http.ts";

const startedAt = Date.now();

Deno.serve((req) => {
  if (req.method === "OPTIONS") return optionsResponse();

  return jsonResponse(200, {
    status: "ok",
    service: "Risk Guardian Edge",
    version: EDGE_CONFIG.VERSION,
    env: EDGE_CONFIG.ENV,
    useMock: EDGE_CONFIG.USE_MOCK,
    uptime_seconds: Math.round((Date.now() - startedAt) / 1000),
    timestamp: new Date().toISOString(),
  });
});
