"use client";

import { createClient } from "@/lib/supabase/client";
import { useCallback, useEffect, useState } from "react";

/** MFA(TOTP) 등록·해제 패널 */
export function MfaPanel() {
  const [factors, setFactors] = useState<
    { id: string; status: string; friendly_name?: string }[]
  >([]);
  const [pendingFactorId, setPendingFactorId] = useState<string | null>(null);
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
  const [verifyCode, setVerifyCode] = useState("");
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const refresh = useCallback(async () => {
    const supabase = createClient();
    const { data, error } = await supabase.auth.mfa.listFactors();
    if (error) {
      setErr(error.message);
      return;
    }
    setFactors(
      (data?.totp ?? []).map((f) => ({
        id: f.id,
        status: f.status,
        friendly_name: f.friendly_name ?? undefined,
      })),
    );
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  async function startEnroll() {
    setLoading(true);
    setErr(null);
    setMsg(null);
    setQrDataUrl(null);
    setPendingFactorId(null);
    setVerifyCode("");
    const supabase = createClient();
    const { data, error } = await supabase.auth.mfa.enroll({
      factorType: "totp",
      friendlyName: "새벽과일 인증앱",
    });
    setLoading(false);
    if (error) {
      setErr(error.message);
      return;
    }
    if (data?.id && data.totp?.qr_code) {
      setPendingFactorId(data.id);
      setQrDataUrl(data.totp.qr_code);
      setMsg("인증 앱으로 QR을 스캔한 뒤, 6자리 코드를 입력하고 인증 완료를 누르세요.");
    }
  }

  async function completeVerify() {
    if (!pendingFactorId || verifyCode.length < 6) {
      setErr("6자리 코드를 입력해 주세요.");
      return;
    }
    setLoading(true);
    setErr(null);
    const supabase = createClient();
    const { error } = await supabase.auth.mfa.challengeAndVerify({
      factorId: pendingFactorId,
      code: verifyCode.trim(),
    });
    setLoading(false);
    if (error) {
      setErr(error.message);
      return;
    }
    setMsg("2단계 인증이 활성화되었습니다.");
    setPendingFactorId(null);
    setQrDataUrl(null);
    setVerifyCode("");
    void refresh();
  }

  async function unenroll(id: string) {
    setLoading(true);
    setErr(null);
    const supabase = createClient();
    const { error } = await supabase.auth.mfa.unenroll({ factorId: id });
    setLoading(false);
    if (error) {
      setErr(error.message);
      return;
    }
    void refresh();
  }

  return (
    <div className="rounded-xl border border-[#dfe8e2] bg-white p-5 shadow-sm">
      <h2 className="text-sm font-semibold text-[#14532d]">
        2단계 인증 (TOTP)
      </h2>
      <p className="mt-1 text-xs text-[#5c6b63]">
        인증 서비스에서 2단계 인증(TOTP)이 켜져 있어야 등록할 수 있습니다.
      </p>
      {err ? (
        <p className="mt-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
          {err}
        </p>
      ) : null}
      {msg ? (
        <p className="mt-3 rounded-lg border border-[#bbf7d0] bg-[#f0fdf4] px-3 py-2 text-sm text-[#166534]">
          {msg}
        </p>
      ) : null}

      {qrDataUrl ? (
        <div className="mt-4 flex flex-col items-center gap-3">
          {/* eslint-disable-next-line @next/next/no-img-element -- data: URL SVG */}
          <img
            src={qrDataUrl}
            alt="TOTP QR"
            className="h-48 w-48 object-contain"
          />
          <input
            type="text"
            inputMode="numeric"
            autoComplete="one-time-code"
            placeholder="6자리 코드"
            value={verifyCode}
            onChange={(e) => setVerifyCode(e.target.value.replace(/\D/g, "").slice(0, 8))}
            className="w-full max-w-xs rounded-lg border border-[#d1ddd6] px-3 py-2 text-center text-lg tracking-widest"
          />
          <button
            type="button"
            disabled={loading}
            onClick={() => void completeVerify()}
            className="rounded-lg bg-[#166534] px-4 py-2 text-sm font-medium text-white hover:bg-[#14532d] disabled:opacity-60"
          >
            인증 완료
          </button>
        </div>
      ) : null}

      <ul className="mt-4 space-y-2 text-sm">
        {factors.length === 0 && !qrDataUrl ? (
          <li className="text-[#7a8a82]">등록된 인증 요소가 없습니다.</li>
        ) : (
          factors.map((f) => (
            <li
              key={f.id}
              className="flex items-center justify-between rounded-lg border border-zinc-100 px-3 py-2"
            >
              <span>
                {f.friendly_name ?? "TOTP"} · {f.status}
              </span>
              <button
                type="button"
                disabled={loading}
                onClick={() => void unenroll(f.id)}
                className="text-xs text-red-700 hover:underline disabled:opacity-50"
              >
                해제
              </button>
            </li>
          ))
        )}
      </ul>

      {!qrDataUrl ? (
        <button
          type="button"
          disabled={loading}
          onClick={() => void startEnroll()}
          className="mt-4 rounded-lg bg-[#166534] px-4 py-2 text-sm font-medium text-white hover:bg-[#14532d] disabled:opacity-60"
        >
          {loading ? "처리 중…" : "TOTP 새로 등록"}
        </button>
      ) : null}
    </div>
  );
}
