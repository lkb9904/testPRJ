import { getProfileRole } from "@/lib/auth/profile-role";
import { createClient } from "@/lib/supabase/server";
import { PublicLanding } from "./public-landing";

/** 일반 고객용 공개 홈 — 로그인 없이 접근 가능 */
export default async function Home() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const profileRole = user
    ? await getProfileRole(supabase, user.id)
    : null;

  return <PublicLanding user={user} profileRole={profileRole} />;
}
