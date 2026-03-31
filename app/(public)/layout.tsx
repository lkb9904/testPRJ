import { PublicFooter } from "@/components/public/public-footer";
import { PublicHeader } from "@/components/public/public-header";
import { getPublicSession } from "@/lib/supabase/public-session";

export default async function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, profileRole } = await getPublicSession();

  return (
    <div className="relative flex min-h-screen flex-col bg-[#f2f7f4] text-[#1a1f1c]">
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.35]"
        style={{
          backgroundImage:
            "radial-gradient(ellipse 80% 50% at 50% -20%, rgba(22, 101, 52, 0.12), transparent 55%)",
        }}
      />
      <PublicHeader user={user} profileRole={profileRole} />
      <div className="relative z-10 flex-1">{children}</div>
      <PublicFooter />
    </div>
  );
}
