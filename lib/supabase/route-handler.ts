import { createServerClient, type CookieOptions } from "@supabase/ssr";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

type CookieToSet = { name: string; value: string; options: CookieOptions };

/**
 * Route Handler 전용 — signOut 시 Set-Cookie가 응답에 실리도록 response에 씁니다.
 * (클라이언트 signOut만으로는 httpOnly 세션이 남는 경우가 있음)
 */
export function createSupabaseRouteHandlerClient(
  request: NextRequest,
  response: NextResponse,
) {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookieOptions: {
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        httpOnly: true,
      },
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
    },
  );
}

/** 요청에 있던 Supabase 세션 쿠키(sb-*)를 응답에서 만료 */
export function expireSupabaseSessionCookies(
  request: NextRequest,
  response: NextResponse,
): void {
  const secure = process.env.NODE_ENV === "production";
  for (const c of request.cookies.getAll()) {
    if (c.name.startsWith("sb-")) {
      response.cookies.set(c.name, "", {
        path: "/",
        maxAge: 0,
        sameSite: "lax",
        secure,
        httpOnly: true,
      });
    }
  }
}
