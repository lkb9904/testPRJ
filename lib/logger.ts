import type { AppError } from "@/lib/errors/app-error";
import { isAppError } from "@/lib/errors/app-error";

const SENSITIVE_KEYS = new Set([
  "password",
  "token",
  "authorization",
  "cookie",
  "set-cookie",
  "secret",
  "apikey",
  "api_key",
  "access_token",
  "refresh_token",
  "service_role",
]);

function redactValue(key: string, value: unknown): unknown {
  const lower = key.toLowerCase();
  if (SENSITIVE_KEYS.has(lower)) return "[REDACTED]";
  if (typeof value === "string" && lower.includes("phone")) {
    return value.length > 4
      ? `${value.slice(0, 2)}***${value.slice(-2)}`
      : "[REDACTED]";
  }
  if (value && typeof value === "object" && !Array.isArray(value)) {
    return redactObject(value as Record<string, unknown>);
  }
  if (Array.isArray(value)) {
    return value.map((v, i) =>
      redactValue(String(i), v),
    );
  }
  return value;
}

function redactObject(obj: Record<string, unknown>): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(obj)) {
    out[k] = redactValue(k, v);
  }
  return out;
}

export type LogLevel = "debug" | "info" | "warn" | "error";

function emit(
  level: LogLevel,
  msg: string,
  meta?: Record<string, unknown>,
): void {
  const line = JSON.stringify({
    ts: new Date().toISOString(),
    level,
    msg,
    ...meta,
  });
  if (level === "error" || level === "warn") {
    console.error(line);
  } else {
    console.log(line);
  }
}

export const logger = {
  debug(msg: string, meta?: Record<string, unknown>) {
    if (process.env.NODE_ENV === "production") return;
    emit("debug", msg, meta ? redactObject(meta) : undefined);
  },
  info(msg: string, meta?: Record<string, unknown>) {
    emit("info", msg, meta ? redactObject(meta) : undefined);
  },
  warn(msg: string, meta?: Record<string, unknown>) {
    emit("warn", msg, meta ? redactObject(meta) : undefined);
  },
  error(msg: string, err?: unknown, meta?: Record<string, unknown>) {
    const base: Record<string, unknown> = { ...(meta ? redactObject(meta) : {}) };
    if (isAppError(err)) {
      base.appError = {
        code: err.code,
        publicMessage: err.publicMessage,
        causeDetail:
          err.causeDetail !== undefined
            ? redactObject(
                typeof err.causeDetail === "object" && err.causeDetail !== null
                  ? (err.causeDetail as Record<string, unknown>)
                  : { detail: String(err.causeDetail) },
              )
            : undefined,
      };
    } else if (err instanceof Error) {
      base.errName = err.name;
      base.errMessage = err.message;
    } else if (err !== undefined) {
      base.err = String(err);
    }
    emit("error", msg, base);
  },
};

export function logAppError(err: AppError, requestId: string): void {
  logger.error("AppError", err, { requestId });
}
