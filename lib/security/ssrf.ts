/**
 * SSRF 완화: 사용자 입력 URL을 서버에서 fetch 하기 전에 호스트를 검증할 때 사용.
 */

const BLOCKED_HOST_PATTERNS =
  /^(localhost|127\.|0\.0\.0\.0|::1|169\.254\.|10\.|192\.168\.|172\.(1[6-9]|2\d|3[0-1])\.)/i;

export function isBlockedHost(hostname: string): boolean {
  const h = hostname.toLowerCase();
  if (h === "localhost") return true;
  if (BLOCKED_HOST_PATTERNS.test(h)) return true;
  return false;
}

/** http/https만, 사설 IP·메타데이터 IP 차단 */
export function assertSafeHttpUrl(raw: string): URL {
  let u: URL;
  try {
    u = new URL(raw);
  } catch {
    throw new Error("잘못된 URL 형식입니다.");
  }
  if (u.protocol !== "http:" && u.protocol !== "https:") {
    throw new Error("허용되지 않은 URL 스킴입니다.");
  }
  if (isBlockedHost(u.hostname)) {
    throw new Error("허용되지 않은 호스트입니다.");
  }
  return u;
}
