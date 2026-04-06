import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { DashboardProviders } from "./dashboard-providers";
import LogoutButton from "./logout-button";
import { SessionIdleGuard } from "./session-idle-guard";

const nav = [
  { href: "/dashboard", label: "대시보드" },
  { href: "/dashboard/pickup", label: "픽업 장소" },
  { href: "/dashboard/products", label: "상품" },
  { href: "/dashboard/stock", label: "픽업 재고" },
  { href: "/dashboard/orders", label: "주문" },
  { href: "/dashboard/brix", label: "당도 측정" },
  { href: "/dashboard/alerts", label: "재고 알림" },
];

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <DashboardProviders>
    <div className="flex min-h-screen bg-zinc-100 font-sans text-zinc-900 dark:bg-zinc-950 dark:text-zinc-100">
      <SessionIdleGuard />
      <aside className="hidden w-56 shrink-0 flex-col border-r border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900 md:flex">
        <div className="flex h-14 items-center border-b border-zinc-200 px-4 dark:border-zinc-800">
          <Link
            href="/dashboard"
            className="text-sm font-semibold tracking-tight text-emerald-700 dark:text-emerald-400"
          >
            새벽과일
          </Link>
        </div>
        <nav className="flex flex-col gap-0.5 p-2">
          {nav.map((item) => (
            <Link
              key={`${item.href}-${item.label}`}
              href={item.href}
              className="rounded-md bg-zinc-100 px-3 py-2 text-sm font-medium text-zinc-900 dark:bg-zinc-800 dark:text-zinc-100"
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-14 items-center justify-between border-b border-zinc-200 bg-white px-4 dark:border-zinc-800 dark:bg-zinc-900 md:px-6">
          <div className="flex items-center gap-3 md:hidden">
            <Link
              href="/dashboard"
              className="text-sm font-semibold text-emerald-700 dark:text-emerald-400"
            >
              새벽과일
            </Link>
          </div>
          <p className="hidden text-sm text-zinc-500 dark:text-zinc-400 md:block">
            관리자 화면
          </p>
          <div className="flex items-center gap-2">
            <LogoutButton />
            <Link
              href="/"
              className="inline-flex items-center rounded-lg border border-zinc-200 bg-white px-3 py-1.5 text-xs font-medium text-emerald-700 transition hover:bg-emerald-50 dark:border-zinc-600 dark:bg-zinc-800 dark:text-emerald-400 dark:hover:bg-zinc-700"
              title="고객용 메인 페이지"
            >
              메인페이지
            </Link>
          </div>
        </header>
        <main className="flex-1 overflow-auto">{children}</main>
      </div>
    </div>
    </DashboardProviders>
  );
}
