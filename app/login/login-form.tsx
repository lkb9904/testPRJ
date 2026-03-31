"use client";

import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

export default function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const err = searchParams.get("error");
  const reason = searchParams.get("reason");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [oauthLoading, setOauthLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  async function signInWithEmail(e: React.FormEvent) {
    e.preventDefault();
    setFormError(null);
    setLoading(true);
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });
    setLoading(false);
    if (error) {
      if (error.message.includes("Invalid login credentials")) {
        setFormError("이메일 또는 비밀번호가 올바르지 않습니다.");
      } else if (error.message.includes("Email not confirmed")) {
        setFormError("이메일 인증을 완료한 뒤 다시 시도해 주세요.");
      } else {
        setFormError(error.message);
      }
      return;
    }
    router.push("/dashboard");
    router.refresh();
  }

  async function signInWithGoogle() {
    setOauthLoading(true);
    setFormError(null);
    /** 로그인 시작한 탭과 동일 origin (localhost vs 127.0.0.1 혼용 방지) */
    const origin = window.location.origin.replace(/\/$/, "");
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        // 쿼리스트링 없음: Supabase Redirect URLs에 정확히 등록하기 쉬움 (?next= 는 거절되는 경우 있음)
        redirectTo: `${origin}/auth/callback`,
      },
    });
    if (error) {
      setOauthLoading(false);
      console.error(error);
      setFormError("Google 로그인을 시작할 수 없습니다.");
    }
  }

  return (
    <div className="w-full space-y-6">
      {reason === "idle" ? (
        <p className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900">
          장시간 사용이 없어 보안을 위해 로그아웃되었습니다. 다시 로그인해 주세요.
        </p>
      ) : null}
      {err === "auth" ? (
        <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
          로그인에 실패했습니다. Supabase에서 Google 로그인 설정을 확인하세요.
        </p>
      ) : null}
      {formError ? (
        <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
          {formError}
        </p>
      ) : null}

      <form onSubmit={(e) => void signInWithEmail(e)} className="space-y-4">
        <div>
          <label
            htmlFor="login-email"
            className="mb-1 block text-sm font-medium text-[#374151]"
          >
            이메일
          </label>
          <input
            id="login-email"
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-xl border border-[#d1ddd6] bg-[#fafdfb] px-3 py-2.5 text-sm outline-none ring-[#166534]/20 transition placeholder:text-[#9ca8a2] focus:border-[#166534] focus:ring-2"
            placeholder="you@example.com"
          />
        </div>
        <div>
          <label
            htmlFor="login-password"
            className="mb-1 block text-sm font-medium text-[#374151]"
          >
            비밀번호
          </label>
          <input
            id="login-password"
            type="password"
            required
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-xl border border-[#d1ddd6] bg-[#fafdfb] px-3 py-2.5 text-sm outline-none ring-[#166534]/20 transition focus:border-[#166534] focus:ring-2"
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-xl bg-[#166534] px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[#14532d] disabled:opacity-60"
        >
          {loading ? "로그인 중…" : "로그인"}
        </button>
      </form>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t border-[#dfe8e2]" />
        </div>
        <div className="relative flex justify-center text-xs uppercase tracking-wide">
          <span className="bg-white px-2 text-[#7a8a82]">또는</span>
        </div>
      </div>

      <button
        type="button"
        onClick={() => void signInWithGoogle()}
        disabled={oauthLoading || loading}
        className="flex w-full items-center justify-center gap-3 rounded-xl border border-[#d1ddd6] bg-white px-4 py-3 text-sm font-medium text-[#374151] shadow-sm transition hover:bg-[#f4faf7] disabled:opacity-60"
      >
        <svg className="h-5 w-5" viewBox="0 0 24 24" aria-hidden>
          <path
            fill="currentColor"
            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
          />
          <path
            fill="currentColor"
            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
          />
          <path
            fill="currentColor"
            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
          />
          <path
            fill="currentColor"
            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
          />
        </svg>
        {oauthLoading ? "연결 중…" : "Google로 계속하기"}
      </button>

      <p className="text-center text-sm text-[#5c6b63]">
        아직 계정이 없으신가요?{" "}
        <Link
          href="/signup"
          className="font-medium text-[#166534] underline-offset-2 hover:underline"
        >
          회원가입
        </Link>
      </p>

      <p className="text-center text-xs leading-relaxed text-[#7a8a82]">
        Google 로그인은 Supabase → Authentication → URL Configuration에{" "}
        <code className="rounded bg-zinc-100 px-1 text-[10px] dark:bg-zinc-800">
          (현재주소)/auth/callback
        </code>{" "}
        을 Redirect URLs에 추가해야 합니다.
      </p>
    </div>
  );
}
