import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const appRoot = path.resolve(__dirname);

const isProd = process.env.NODE_ENV === "production";
/** XSS·클릭재킹 완화 — Next/React 인라인 스크립트에 맞춤 (운영에서 필요 시 nonce로 강화) */
const contentSecurityPolicy = isProd
  ? [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: https: blob:",
      "font-src 'self'",
      "connect-src 'self' https://*.supabase.co wss://*.supabase.co https://*.supabase.in",
      "frame-ancestors 'none'",
      "base-uri 'self'",
      "form-action 'self'",
    ].join("; ")
  : [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: https: blob:",
      "connect-src 'self' https://*.supabase.co wss://*.supabase.co ws://localhost:* http://localhost:*",
      "frame-ancestors 'none'",
    ].join("; ");

/** @type {import('next').NextConfig} */
const nextConfig = {
  // 워크스페이스가 C:\Project 일 때 Turbopack이 상위에서 모듈을 찾는 문제 완화
  turbopack: {
    root: appRoot,
    resolveAlias: {
      tailwindcss: path.join(appRoot, "node_modules", "tailwindcss"),
      "@tailwindcss/postcss": path.join(
        appRoot,
        "node_modules",
        "@tailwindcss",
        "postcss",
      ),
    },
  },
  env: {
    NEXT_PUBLIC_SUPABASE_URL:
      process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY:
      process.env.SUPABASE_ANON_KEY ??
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY,
    // Vercel 빌드 시 VERCEL_URL 자동 주입 → OAuth redirectTo 기준 URL (예: testprj-web.vercel.app)
    NEXT_PUBLIC_SITE_URL:
      process.env.NEXT_PUBLIC_SITE_URL ??
      (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : undefined),
  },
  async headers() {
    const securityHeaders = [
      { key: "X-DNS-Prefetch-Control", value: "on" },
      { key: "X-Content-Type-Options", value: "nosniff" },
      { key: "X-Frame-Options", value: "DENY" },
      { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
      {
        key: "Permissions-Policy",
        value: "camera=(), microphone=(), geolocation=(), interest-cohort=()",
      },
      { key: "Content-Security-Policy", value: contentSecurityPolicy },
    ];
    if (isProd) {
      securityHeaders.push({
        key: "Strict-Transport-Security",
        value: "max-age=63072000; includeSubDomains; preload",
      });
    }
    return [
      {
        source: "/:path*",
        headers: securityHeaders,
      },
    ];
  },
};

export default nextConfig;
