/**
 * telemetry — Collects anonymized usage metrics and logs them.
 *
 * POST { event, safetyScore?, route, ts }
 * Returns 204 on success.
 */
import { optionsResponse, jsonResponse, errorResponse, buildContext, parseJsonBody } from "../_shared/http.ts";
import { logRequest, logResponse } from "../_shared/logger.ts";

interface TelemetryEvent {
  event: "risk_assessed" | "settings_updated" | "page_view" | "wallet_connected";
  safetyScore?: number;
  route: string;
  ts: string;
  metadata?: Record<string, unknown>;
}

const VALID_EVENTS = new Set(["risk_assessed", "settings_updated", "page_view", "wallet_connected"]);

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return optionsResponse();
  if (req.method !== "POST") return errorResponse("METHOD_NOT_ALLOWED", "Method not allowed", 405);

  const ctx = buildContext(req);
  logRequest(ctx);

  try {
    const body = await parseJsonBody<TelemetryEvent>(req);

    if (!body.event || !VALID_EVENTS.has(body.event)) {
      return errorResponse("VALIDATION_ERROR", "Invalid event type", 400, ctx);
    }
    if (!body.route || typeof body.route !== "string") {
      return errorResponse("VALIDATION_ERROR", "route is required", 400, ctx);
    }

    // Hash IP for privacy
    const ipHash = await crypto.subtle.digest(
      "SHA-256",
      new TextEncoder().encode(ctx.ip + "risk-guardian-salt"),
    ).then((buf) => Array.from(new Uint8Array(buf).slice(0, 4)).map((b) => b.toString(16).padStart(2, "0")).join(""));

    // Structured log — can be picked up by log aggregation
    console.log(JSON.stringify({
      type: "telemetry",
      event: body.event,
      safetyScore: body.safetyScore,
      route: body.route,
      ts: body.ts || new Date().toISOString(),
      ipHash,
      region: ctx.region,
      requestId: ctx.requestId,
    }));

    logResponse(ctx, 204);
    return new Response(null, { status: 204, headers: { "Access-Control-Allow-Origin": "*" } });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Invalid request";
    return errorResponse("VALIDATION_ERROR", msg, 400, ctx);
  }
});
