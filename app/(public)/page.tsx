import { HomeContent } from "@/components/public/home-content";
import { getPublicSession } from "@/lib/supabase/public-session";

export default async function HomePage() {
  const { user, profileRole } = await getPublicSession();
  return <HomeContent user={user} profileRole={profileRole} />;
}
