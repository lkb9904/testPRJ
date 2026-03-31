"use client";

import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function SignupForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [fullName, setFullName] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setMessage(null);

    if (password.length < 8) {
      setError("비밀번호는 8자 이상으로 입력해 주세요.");
      return;
    }
    if (password !== confirm) {
      setError("비밀번호 확인이 일치하지 않습니다.");
      return;
    }

    setLoading(true);
    const origin = window.location.origin.replace(/\/$/, "");
    const supabase = createClient();

    const { data, error: signErr } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: {
        emailRedirectTo: `${origin}/auth/callback`,
        data: {
          full_name: fullName.trim() || undefined,
        },
      },
    });

    setLoading(false);

    if (signErr) {
      if (signErr.message.includes("already registered")) {
        setError("이미 가입된 이메일입니다. 로그인해 주세요.");
      } else {
        setError(signErr.message);
      }
      return;
    }

    if (data.session) {
      router.push("/");
      router.refresh();
      return;
    }

    setMessage(
      "가입 확인 메일을 보냈습니다. 메일의 링크를 누른 뒤 로그인해 주세요.",
    );
  }

  return (
    <form onSubmit={(e) => void handleSignup(e)} className="space-y-4">
      {error ? (
        <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
          {error}
        </p>
      ) : null}
      {message ? (
        <p className="rounded-lg border border-[#bbf7d0] bg-[#f0fdf4] px-3 py-2 text-sm text-[#166534]">
          {message}
        </p>
      ) : null}

      <div>
        <label
          htmlFor="name"
          className="mb-1 block text-sm font-medium text-[#374151]"
        >
          이름 (선택)
        </label>
        <input
          id="name"
          type="text"
          autoComplete="name"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          className="w-full rounded-xl border border-[#d1ddd6] bg-[#fafdfb] px-3 py-2.5 text-sm outline-none ring-[#166534]/20 transition placeholder:text-[#9ca8a2] focus:border-[#166534] focus:ring-2"
          placeholder="홍길동"
        />
      </div>

      <div>
        <label
          htmlFor="email"
          className="mb-1 block text-sm font-medium text-[#374151]"
        >
          이메일
        </label>
        <input
          id="email"
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
          htmlFor="password"
          className="mb-1 block text-sm font-medium text-[#374151]"
        >
          비밀번호 (8자 이상)
        </label>
        <input
          id="password"
          type="password"
          required
          autoComplete="new-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full rounded-xl border border-[#d1ddd6] bg-[#fafdfb] px-3 py-2.5 text-sm outline-none ring-[#166534]/20 transition focus:border-[#166534] focus:ring-2"
        />
      </div>

      <div>
        <label
          htmlFor="confirm"
          className="mb-1 block text-sm font-medium text-[#374151]"
        >
          비밀번호 확인
        </label>
        <input
          id="confirm"
          type="password"
          required
          autoComplete="new-password"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          className="w-full rounded-xl border border-[#d1ddd6] bg-[#fafdfb] px-3 py-2.5 text-sm outline-none ring-[#166534]/20 transition focus:border-[#166534] focus:ring-2"
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-xl bg-[#166534] px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[#14532d] disabled:opacity-60"
      >
        {loading ? "가입 처리 중…" : "회원가입"}
      </button>

      <p className="text-center text-sm text-[#5c6b63]">
        이미 계정이 있으신가요?{" "}
        <Link
          href="/login"
          className="font-medium text-[#166534] underline-offset-2 hover:underline"
        >
          로그인
        </Link>
      </p>
    </form>
  );
}
