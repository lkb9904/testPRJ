import { isOriginAllowed } from "@/lib/env";

const SAFE_METHODS = new Set(["GET", "HEAD", "OPTIONS"]);

/**
 * CSRF 완화: 상태 변경 요청에 대해 Origin(또는 Referer)이 허용 목록과 일치하는지 검사.
 * SameSite=Lax 쿠키와 함께 사용. (Supabase 직접 호출은 supabase 도메인으로 가므로 별도)
 */
export function assertSameOriginForMutation(request: Request): boolean {
  if (SAFE_METHODS.has(request.method)) return true;
  const origin = request.headers.get("origin");
  if (origin) {
    return isOriginAllowed(origin);
  }
  const referer = request.headers.get("referer");
  if (!referer) {
    return process.env.NODE_ENV !== "production";
  }
  try {
    const u = new URL(referer);
    return isOriginAllowed(u.origin);
  } catch {
    return false;
  }
}
