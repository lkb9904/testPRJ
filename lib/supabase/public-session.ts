import { cache } from "react";
import { getProfileRole } from "@/lib/auth/profile-role";
import { createClient } from "@/lib/supabase/server";

/** (public) 레이아웃·홈에서 동일 요청 내 1회만 조회 */
export const getPublicSession = cache(async () => {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const profileRole = user
    ? await getProfileRole(supabase, user.id)
    : null;
  return { user, profileRole };
});
