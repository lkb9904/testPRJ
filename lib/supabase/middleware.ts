import { createServerClient, type CookieOptions } from "@supabase/ssr";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

type CookieToSet = { name: string; value: string; options: CookieOptions };

/**
 * 미들웨어 전용 Supabase 클라이언트 — 세션 갱신·쿠키 보안 옵션.
 */
export function createSupabaseMiddlewareClient(
  request: NextRequest,
  response: NextResponse,
) {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet: CookieToSet[]) {
          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options);
          });
        },
      },
      cookieOptions: {
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        httpOnly: true,
      },
    },
  );
}
