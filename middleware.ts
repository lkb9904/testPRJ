import { assertSameOriginForMutation } from "@/lib/security/origin";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit/memory";
import { createSupabaseMiddlewareClient } from "@/lib/supabase/middleware";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

export async function middleware(request: NextRequest) {
  const requestId =
    request.headers.get("x-request-id") ?? crypto.randomUUID();

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-request-id", requestId);

  const ip = getClientIp(request);
  const path = request.nextUrl.pathname;

  if (path.startsWith("/api/")) {
    const { ok } = checkRateLimit(`api:${ip}`, { windowMs: 60_000, max: 120 });
    if (!ok) {
      return NextResponse.json(
        {
          ok: false,
          error: {
            code: "RATE_LIMIT",
            message: "요청이 너무 많습니다. 잠시 후 다시 시도해 주세요.",
            requestId,
          },
        },
        { status: 429, headers: { "x-request-id": requestId } },
      );
    }
    if (
      path !== "/api/health" &&
      !assertSameOriginForMutation(request)
    ) {
      return NextResponse.json(
        {
          ok: false,
          error: {
            code: "FORBIDDEN",
            message: "허용되지 않은 요청입니다.",
            requestId,
          },
        },
        { status: 403, headers: { "x-request-id": requestId } },
      );
    }
  }

  if (path === "/login" || path === "/signup") {
    const { ok } = checkRateLimit(`authpage:${ip}:${path}`, {
      windowMs: 60_000,
      max: 80,
    });
    if (!ok) {
      return new NextResponse('요청이 너무 많습니다.' , {
        status: 429,
        headers: { "x-request-id": requestId, "content-type": "text/plain; charset=utf-8" },
      });
    }
  }

  let response = NextResponse.next({
    request: { headers: requestHeaders },
  });

  const supabase = createSupabaseMiddlewareClient(request, response);
  await supabase.auth.getUser();

  response.headers.set("x-request-id", requestId);
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set(
    "Permissions-Policy",
    "camera=(), microphone=(), geolocation=()",
  );

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
