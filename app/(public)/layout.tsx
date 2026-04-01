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
    <div className="relative flex min-h-screen flex-col bg-white text-[#1a1f1c]">
      <PublicHeader user={user} profileRole={profileRole} />
      <div className="relative z-10 flex-1">{children}</div>
      <PublicFooter />
    </div>
  );
}
