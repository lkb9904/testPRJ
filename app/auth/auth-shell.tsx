import type { ReactNode } from "react";

/** 로그인·회원가입 공통 PC 레이아웃 (온브릭스류: 그린 포인트 + 크림 배경) */
export function AuthShell({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: ReactNode;
}) {
  return (
    <div className="relative flex min-h-screen flex-col bg-[#f2f7f4] text-[#1a1f1c]">
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.35]"
        style={{
          backgroundImage:
            "radial-gradient(ellipse 80% 50% at 50% -20%, rgba(22, 101, 52, 0.12), transparent 55%)",
        }}
      />
      <header className="relative z-10 border-b border-[#dfe8e2]/80 bg-white/80 backdrop-blur-sm">
        <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-6">
          <a
            href="/"
            className="flex items-baseline gap-2 font-semibold tracking-tight text-[#14532d]"
          >
            <span className="text-lg">새벽과일</span>
            <span className="text-xs font-normal text-[#5c6b63]">
              로그인
            </span>
          </a>
        </div>
      </header>

      <main className="relative z-10 flex flex-1 items-center justify-center px-4 py-12">
        <div className="w-full max-w-[440px] rounded-2xl border border-[#dfe8e2] bg-white p-8 shadow-[0_12px_40px_-12px_rgba(20,83,45,0.12)]">
          <h1 className="text-center text-2xl font-semibold tracking-tight text-[#14532d]">
            {title}
          </h1>
          <p className="mt-2 text-center text-sm leading-relaxed text-[#5c6b63]">
            {subtitle}
          </p>
          <div className="mt-8">{children}</div>
        </div>
      </main>

      <footer className="relative z-10 border-t border-[#dfe8e2]/80 bg-white/60 py-4 text-center text-xs text-[#7a8a82]">
        © {new Date().getFullYear()} 새벽과일 · 신선한 과일을 새벽에
      </footer>
    </div>
  );
}
