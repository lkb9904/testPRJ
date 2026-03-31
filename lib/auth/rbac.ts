import { createClient } from "@/lib/supabase/server";

export type Role = "admin" | "staff" | "customer";

/**
 * AuthZ: profiles.role 기반. 테넌트 격리는 RLS + auth.uid()로 고객 데이터를 분리
 * (한 사용자 = 한 테넌트 경계; 다점포 조직은 향후 organization_id 확장).
 */
export async function getSessionRole(): Promise<{
  userId: string;
  role: Role;
  email: string | null;
} | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();

  const role = (profile?.role as Role | undefined) ?? "customer";
  return { userId: user.id, role, email: user.email ?? null };
}

export async function requireStaff(): Promise<{
  userId: string;
  role: Role;
  email: string | null;
}> {
  const s = await getSessionRole();
  if (!s || (s.role !== "admin" && s.role !== "staff")) {
    throw new Error("FORBIDDEN");
  }
  return s;
}

export async function requireAdmin(): Promise<{
  userId: string;
  role: Role;
  email: string | null;
}> {
  const s = await getSessionRole();
  if (!s || s.role !== "admin") {
    throw new Error("FORBIDDEN");
  }
  return s;
}
