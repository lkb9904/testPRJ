import { MfaPanel } from "./mfa-panel";

export default function SecurityPage() {
  return (
    <div className="p-4 md:p-6">
      <h1 className="text-xl font-semibold tracking-tight text-[#14532d]">
        보안 설정
      </h1>
      <p className="mt-1 text-sm text-[#5c6b63]">
        2FA(TOTP) 및 세션 정책은 Supabase Auth 설정과 함께 사용합니다.
      </p>
      <div className="mt-8 max-w-lg">
        <MfaPanel />
      </div>
    </div>
  );
}
