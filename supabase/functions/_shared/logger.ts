/**
 * _shared/logger.ts — Structured JSON logging for edge functions.
 */
import type { EdgeContext } from "./types.ts";
import { EDGE_CONFIG } from "./config.ts";

const LEVELS = { debug: 0, info: 1, warn: 2, error: 3 } as const;

function shouldLog(level: keyof typeof LEVELS): boolean {
  return LEVELS[level] >= LEVELS[EDGE_CONFIG.LOG_LEVEL];
}

function emit(level: string, msg: string, data?: Record<string, unknown>) {
  const entry = { ts: new Date().toISOString(), level, msg, ...data };
  if (level === "error") console.error(JSON.stringify(entry));
  else if (level === "warn") console.warn(JSON.stringify(entry));
  else console.log(JSON.stringify(entry));
}

export function logRequest(ctx: EdgeContext, extra?: Record<string, unknown>) {
  if (!shouldLog("info")) return;
  emit("info", "request", { requestId: ctx.requestId, method: ctx.method, path: ctx.path, ip: ctx.ip, region: ctx.region, ...extra });
}

export function logResponse(ctx: EdgeContext, status: number, extra?: Record<string, unknown>) {
  if (!shouldLog("info")) return;
  const latencyMs = Math.round(performance.now() - ctx.startTime);
  emit("info", "response", { requestId: ctx.requestId, status, latencyMs, ...extra });
}

export function logError(ctx: EdgeContext, err: unknown) {
  if (!shouldLog("error")) return;
  const message = err instanceof Error ? err.message : String(err);
  emit("error", "error", { requestId: ctx.requestId, error: message });
}

export function logDebug(msg: string, data?: Record<string, unknown>) {
  if (!shouldLog("debug")) return;
  emit("debug", msg, data);
}
