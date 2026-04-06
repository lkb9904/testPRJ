import Link from "next/link";
import { redirect } from "next/navigation";
import { getPublicSession } from "@/lib/supabase/public-session";

const navItems = [
  { href: "/mypage/orders", label: "주문 내역" },
  { href: "/mypage/addresses", label: "배송지 관리" },
  { href: "/mypage/profile", label: "프로필" },
];

export default async function MyPageLayout({ children }: { children: React.ReactNode }) {
  const { user } = await getPublicSession();
  if (!user) redirect("/login?redirect=/mypage/orders");

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-8 md:py-12">
      <h1 className="text-xl font-bold text-[#1a1f1c]">마이페이지</h1>
      <p className="mt-1 text-sm text-[#9ca3a0]">{user.email}</p>
      <div className="mt-6 flex flex-col gap-8 md:flex-row">
        <nav className="flex shrink-0 gap-2 md:w-40 md:flex-col">
          {navItems.map((n) => (
            <Link
              key={n.href}
              href={n.href}
              className="rounded-lg px-3 py-2 text-sm font-medium text-[#374151] transition hover:bg-[#f4faf7]"
            >
              {n.label}
            </Link>
          ))}
        </nav>
        <div className="min-w-0 flex-1">{children}</div>
      </div>
    </div>
  );
}
