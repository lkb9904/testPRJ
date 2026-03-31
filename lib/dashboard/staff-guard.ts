import { getSessionRole } from "@/lib/auth/rbac";

/** 관리자·스태프 전용 서버 액션/페이지에서 사용 */
export async function assertStaff(): Promise<
  { ok: true } | { error: string }
> {
  const s = await getSessionRole();
  if (!s || (s.role !== "admin" && s.role !== "staff")) {
    return { error: "관리자 권한이 필요합니다." };
  }
  return { ok: true };
}
