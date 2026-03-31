import { createClient } from "@/lib/supabase/server";
import { logger } from "@/lib/logger";
import { NextResponse } from "next/server";

/** 오픈 리다이렉트·경로 조작 방지 */
function sanitizeNextPath(next: string | null): string {
  if (!next || !next.startsWith("/") || next.startsWith("//")) {
    return "/";
  }
  if (next.includes("..") || next.includes("\\")) {
    return "/";
  }
  return next;
}

/** Vercel 등 프록시 뒤에서 실제 공개 도메인으로 리다이렉트하기 위한 origin */
function getRequestOrigin(request: Request): string {
  const url = new URL(request.url);
  const forwardedHost = request.headers.get("x-forwarded-host");
  const forwardedProto = request.headers.get("x-forwarded-proto");
  if (forwardedHost) {
    const host = forwardedHost.split(",")[0].trim();
    const proto = forwardedProto?.split(",")[0].trim() || "https";
    return `${proto}://${host}`;
  }
  return url.origin;
}

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const nextPath = sanitizeNextPath(requestUrl.searchParams.get("next"));
  const origin = getRequestOrigin(request);

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(`${origin}${nextPath}`);
    }
    logger.error("auth.callback_exchange_failed", error);
  }

  return NextResponse.redirect(`${origin}/login?error=auth`);
}
