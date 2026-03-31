-- 감사 로그, 최소 권한 보강 (SECURITY.md 28항목 대응)

-- ---------------------------------------------------------------------------
-- 감사 로그 (직접 INSERT 금지 — log_audit() 만 사용)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  user_id UUID REFERENCES auth.users (id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  resource_type TEXT,
  resource_id TEXT,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  request_id TEXT
);

CREATE INDEX IF NOT EXISTS idx_audit_logs_created ON public.audit_logs (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_logs_user ON public.audit_logs (user_id);

ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "audit_logs_staff_select" ON public.audit_logs;

CREATE POLICY "audit_logs_staff_select"
  ON public.audit_logs FOR SELECT
  USING (public.is_staff());

REVOKE INSERT, UPDATE, DELETE ON public.audit_logs FROM authenticated;
REVOKE ALL ON public.audit_logs FROM anon;

GRANT SELECT ON public.audit_logs TO authenticated;

CREATE OR REPLACE FUNCTION public.log_audit(
  p_action TEXT,
  p_resource_type TEXT DEFAULT NULL,
  p_resource_id TEXT DEFAULT NULL,
  p_metadata JSONB DEFAULT '{}'::jsonb,
  p_request_id TEXT DEFAULT NULL
) RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  new_id UUID;
BEGIN
  INSERT INTO public.audit_logs (
    user_id,
    action,
    resource_type,
    resource_id,
    metadata,
    request_id
  )
  VALUES (
    auth.uid(),
    p_action,
    p_resource_type,
    p_resource_id,
    COALESCE(p_metadata, '{}'::jsonb),
    p_request_id
  )
  RETURNING id INTO new_id;
  RETURN new_id;
END;
$$;

GRANT EXECUTE ON FUNCTION public.log_audit(TEXT, TEXT, TEXT, JSONB, TEXT) TO authenticated;

COMMENT ON TABLE public.audit_logs IS '감사 로그 — 민감 필드는 metadata에 저장하지 말 것';
