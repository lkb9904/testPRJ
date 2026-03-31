"use client";

import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { useEffect, useRef } from "react";

const DEFAULT_MS = 30 * 60 * 1000;

/** 세션 유휴 타임아웃 — JWT 만료와 별도로 클라이언트에서 로그아웃 (NEXT_PUBLIC_SESSION_IDLE_MS) */
export function SessionIdleGuard() {
  const router = useRouter();
  const idleMs = (() => {
    const raw = process.env.NEXT_PUBLIC_SESSION_IDLE_MS;
    if (!raw) return DEFAULT_MS;
    const n = Number(raw);
    return Number.isFinite(n) && n >= 60_000 ? n : DEFAULT_MS;
  })();
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const signOutIdle = async () => {
      const supabase = createClient();
      await supabase.auth.signOut();
      router.push("/login?reason=idle");
      router.refresh();
    };

    const reset = () => {
      if (timer.current) clearTimeout(timer.current);
      timer.current = setTimeout(() => {
        void signOutIdle();
      }, idleMs);
    };

    reset();
    const ev = ["pointerdown", "keydown", "scroll", "touchstart"] as const;
    ev.forEach((e) =>
      window.addEventListener(e, reset, { passive: true }),
    );
    return () => {
      ev.forEach((e) => window.removeEventListener(e, reset));
      if (timer.current) clearTimeout(timer.current);
    };
  }, [idleMs, router]);

  return null;
}
