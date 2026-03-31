/**
 * 애플리케이션 에러 타입 분리 — 내부 코드/원인과 클라이언트 노출 메시지를 분리.
 */

export type AppErrorCode =
  | "INTERNAL"
  | "VALIDATION"
  | "UNAUTHORIZED"
  | "FORBIDDEN"
  | "NOT_FOUND"
  | "RATE_LIMIT"
  | "CONFLICT"
  | "BAD_REQUEST";

export class AppError extends Error {
  readonly code: AppErrorCode;
  readonly status: number;
  /** 내부 로그용 상세 (클라이언트에 노출 금지) */
  readonly causeDetail?: unknown;
  readonly publicMessage: string;

  constructor(
    code: AppErrorCode,
    publicMessage: string,
    options?: {
      status?: number;
      cause?: unknown;
      causeDetail?: unknown;
    },
  ) {
    const causeErr =
      options?.cause instanceof Error ? options.cause : undefined;
    super(publicMessage, causeErr ? { cause: causeErr } : undefined);
    this.name = "AppError";
    this.code = code;
    this.publicMessage = publicMessage;
    this.causeDetail = options?.causeDetail ?? options?.cause;
    this.status =
      options?.status ??
      (code === "UNAUTHORIZED"
        ? 401
        : code === "FORBIDDEN"
          ? 403
          : code === "NOT_FOUND"
            ? 404
            : code === "RATE_LIMIT"
              ? 429
              : code === "VALIDATION" || code === "BAD_REQUEST"
                ? 400
                : 500);
  }

  /** API/경계 응답용 — 스택·내부 메시지 제외 */
  toJSON(requestId: string) {
    return {
      ok: false as const,
      error: {
        code: this.code,
        message: this.publicMessage,
        requestId,
      },
    };
  }
}

export function isAppError(e: unknown): e is AppError {
  return e instanceof AppError;
}
