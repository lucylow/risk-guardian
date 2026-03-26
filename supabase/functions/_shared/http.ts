/**
 * _shared/http.ts — HTTP helpers: CORS headers, typed JSON responses, error shaping.
 */
import type { ErrorCode, EdgeContext } from "./types.ts";

export const corsHeaders: Record<string, string> = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

/** Preflight response */
export function optionsResponse(): Response {
  return new Response(null, { headers: corsHeaders });
}

/** Typed JSON response with CORS + optional extra headers */
export function jsonResponse<T>(status: number, body: T, extra?: Record<string, string>): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json", ...extra },
  });
}

/** Structured error response */
export function errorResponse(
  code: ErrorCode,
  message: string,
  status = 400,
  ctx?: EdgeContext,
  details?: unknown,
): Response {
  return jsonResponse(status, {
    error: message,
    code,
    ...(ctx ? { requestId: ctx.requestId } : {}),
    ...(details ? { details } : {}),
  });
}

/** Build EdgeContext from a Request */
export function buildContext(req: Request): import("./types.ts").EdgeContext {
  const url = new URL(req.url);
  return {
    requestId: crypto.randomUUID(),
    startTime: performance.now(),
    ip: req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown",
    region: req.headers.get("x-region") ?? "unknown",
    method: req.method,
    path: url.pathname,
  };
}

/** Parse JSON body safely */
export async function parseJsonBody<T = unknown>(req: Request): Promise<T> {
  try {
    return await req.json() as T;
  } catch {
    throw new ValidationError("Invalid JSON body");
  }
}

export class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ValidationError";
  }
}
