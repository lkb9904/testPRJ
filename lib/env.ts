import { z } from "zod";

/**
 * 런타임 환경 검증 — Secret은 로그에 절대 출력하지 않음 (logger 레드액션 참고).
 */
const publicSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(32),
  NEXT_PUBLIC_SITE_URL: z.string().url().optional(),
  NEXT_PUBLIC_SESSION_IDLE_MS: z.coerce.number().min(60000).optional(),
});

function parseAllowedOrigins(): string[] {
  const raw = process.env.ALLOWED_ORIGINS?.trim();
  if (!raw) {
    const site = process.env.NEXT_PUBLIC_SITE_URL;
    if (site) return [new URL(site).origin];
    return [];
  }
  return raw.split(",").map((s) => s.trim()).filter(Boolean);
}

let cachedPublic: z.infer<typeof publicSchema> | null = null;

export function getPublicEnv(): z.infer<typeof publicSchema> {
  if (cachedPublic) return cachedPublic;
  const parsed = publicSchema.safeParse({
    NEXT_PUBLIC_SUPABASE_URL:
      process.env.NEXT_PUBLIC_SUPABASE_URL ??
      process.env.SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY:
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??
      process.env.SUPABASE_ANON_KEY,
    NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
    NEXT_PUBLIC_SESSION_IDLE_MS: process.env.NEXT_PUBLIC_SESSION_IDLE_MS,
  });
  if (!parsed.success) {
    throw new Error(
      `환경 변수 검증 실패: ${parsed.error.flatten().fieldErrors}`,
    );
  }
  cachedPublic = parsed.data;
  return cachedPublic;
}

export function getAllowedOrigins(): string[] {
  return parseAllowedOrigins();
}

export function isOriginAllowed(origin: string | null): boolean {
  if (!origin) return false;
  const allowed = getAllowedOrigins();
  if (allowed.length === 0) {
    if (process.env.NODE_ENV === "production") {
      return false;
    }
    return true;
  }
  return allowed.includes(origin);
}
