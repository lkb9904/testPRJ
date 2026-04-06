import { getPublicSession } from "@/lib/supabase/public-session";
import { createClient } from "@/lib/supabase/server";
import { ProfileClient } from "./profile-client";

export const metadata = { title: "프로필 · 새벽과일" };

export default async function ProfilePage() {
  const { user } = await getPublicSession();
  if (!user) return null;

  const supabase = await createClient();
  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, phone")
    .eq("id", user.id)
    .single();

  return (
    <ProfileClient
      email={user.email ?? ""}
      fullName={profile?.full_name ?? ""}
      phone={profile?.phone ?? ""}
    />
  );
}
