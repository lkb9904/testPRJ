import type { SupabaseClient } from "@supabase/supabase-js";

export type ProfileRole = "admin" | "staff" | "customer";

/** DB profiles.role — 없으면 customer 취급 */
export async function getProfileRole(
  supabase: SupabaseClient,
  userId: string,
): Promise<ProfileRole> {
  const { data } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", userId)
    .maybeSingle();

  const r = data?.role as ProfileRole | undefined;
  if (r === "admin" || r === "staff" || r === "customer") return r;
  return "customer";
}

export function isStaffOrAdmin(role: ProfileRole): boolean {
  return role === "admin" || role === "staff";
}
