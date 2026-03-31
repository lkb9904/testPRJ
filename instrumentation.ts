/**
 * Node 런타임 전역 예외 훅 — 부트스트랩 단계에서는 logger 대신 구조화 console만 사용.
 */
export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    process.on("unhandledRejection", (reason) => {
      console.error(
        JSON.stringify({
          ts: new Date().toISOString(),
          level: "error",
          msg: "unhandledRejection",
          detail: String(reason),
        }),
      );
    });
    process.on("uncaughtException", (err) => {
      console.error(
        JSON.stringify({
          ts: new Date().toISOString(),
          level: "error",
          msg: "uncaughtException",
          name: err.name,
          message: err.message,
        }),
      );
    });
  }
}
