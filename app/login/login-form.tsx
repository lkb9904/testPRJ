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
    router.push("/");
    router.refresh();
  }

  async function signInWithGoogle() {
    setFormError(null);
    setOauthLoading(true);
    const supabase = createClient();
    const origin = window.location.origin;
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${origin}/auth/callback`,
      },
    });
    if (error) {
      setOauthLoading(false);
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
          로그인에 실패했습니다. 잠시 후 다시 시도해 주세요.
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
          disabled={loading || oauthLoading}
          className="w-full rounded-xl bg-[#166534] px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[#14532d] disabled:opacity-60"
        >
          {loading ? "로그인 중…" : "로그인"}
        </button>
      </form>

      <div className="relative">
        <div className="absolute inset-0 flex items-center" aria-hidden>
          <div className="w-full border-t border-[#dfe8e2]" />
        </div>
        <div className="relative flex justify-center text-xs">
          <span className="bg-white px-3 text-[#7a8a82]">또는</span>
        </div>
      </div>

      <button
        type="button"
        disabled={loading || oauthLoading}
        onClick={() => void signInWithGoogle()}
        className="w-full rounded-xl border border-[#d1ddd6] bg-white px-4 py-3 text-sm font-semibold text-[#374151] shadow-sm transition hover:bg-[#fafdfb] disabled:opacity-60"
      >
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
    </div>
  );
}
