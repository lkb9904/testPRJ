import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const appRoot = path.resolve(__dirname);

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
};

export default nextConfig;
