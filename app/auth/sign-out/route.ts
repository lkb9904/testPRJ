import {
  createSupabaseRouteHandlerClient,
  expireSupabaseSessionCookies,
} from "@/lib/supabase/route-handler";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

function sanitizeNextPath(next: string | null): string {
  if (!next || !next.startsWith("/") || next.startsWith("//")) {
    return "/";
  }
  if (next.includes("..") || next.includes("\\")) {
    return "/";
  }
  return next;
}

async function signOutAndRedirect(request: NextRequest, nextPath: string | null) {
  const safeNext = sanitizeNextPath(nextPath);
  const redirectUrl = new URL(safeNext, request.url).toString();

  const response = NextResponse.redirect(redirectUrl, 302);
  const supabase = createSupabaseRouteHandlerClient(request, response);

  await supabase.auth.signOut({ scope: "global" });
  expireSupabaseSessionCookies(request, response);

  return response;
}

/** 브라우저에서 로그아웃 링크로 이동할 때 (전체 세션·쿠키 정리) */
export async function GET(request: NextRequest) {
  const next = request.nextUrl.searchParams.get("next");
  return signOutAndRedirect(request, next);
}

/** 폼 POST 등에서 호출 */
export async function POST(request: NextRequest) {
  let next: string | null = null;
  const ct = request.headers.get("content-type") ?? "";
  if (ct.includes("application/x-www-form-urlencoded") || ct.includes("multipart/form-data")) {
    try {
      const form = await request.formData();
      next = form.get("next")?.toString() ?? null;
    } catch {
      next = null;
    }
  }
  if (!next) {
    try {
      const body = (await request.json()) as { next?: string };
      next = body?.next ?? null;
    } catch {
      next = request.nextUrl.searchParams.get("next");
    }
  }
  return signOutAndRedirect(request, next);
}
