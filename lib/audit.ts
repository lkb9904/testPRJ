import { createClient } from "@/lib/supabase/server";
import { headers } from "next/headers";
import { logger } from "@/lib/logger";

/**
 * 감사 로그 (DB RLS: 스태프만 조회). 민감정보는 metadata에 넣지 말 것.
 */
export async function writeAudit(
  action: string,
  meta?: {
    resource_type?: string;
    resource_id?: string;
    metadata?: Record<string, unknown>;
  },
): Promise<void> {
  try {
    const h = await headers();
    const requestId = h.get("x-request-id") ?? undefined;
    const supabase = await createClient();
    const { error } = await supabase.rpc(
      "log_audit",
      {
        p_action: action,
        p_resource_type: meta?.resource_type ?? null,
        p_resource_id: meta?.resource_id ?? null,
        p_metadata: meta?.metadata ?? {},
        p_request_id: requestId ?? null,
      },
    );
    if (error) {
      logger.warn("audit_write_failed", { action, message: error.message });
    }
  } catch (e) {
    logger.warn("audit_write_exception", { action, err: String(e) });
  }
}
