import { MfaPanel } from "./mfa-panel";

export default function SecurityPage() {
  return (
    <div className="p-4 md:p-6">
      <h1 className="text-xl font-semibold tracking-tight text-[#14532d]">
        보안 설정
      </h1>
      <p className="mt-1 text-sm text-[#5c6b63]">
        2단계 인증(TOTP)을 등록·해제할 수 있습니다.
      </p>
      <div className="mt-8 max-w-lg">
        <MfaPanel />
      </div>
    </div>
  );
}
