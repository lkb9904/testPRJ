"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { createClient as createBrowserClient } from "@/lib/supabase/client";

export function ProfileClient({
  email,
  fullName: initialName,
  phone: initialPhone,
}: {
  email: string;
  fullName: string;
  phone: string;
}) {
  const router = useRouter();
  const [fullName, setFullName] = useState(initialName);
  const [phone, setPhone] = useState(initialPhone);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  async function handleSave() {
    setSaving(true);
    setMsg(null);
    const supabase = createBrowserClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setMsg("로그인이 필요합니다."); setSaving(false); return; }

    const { error } = await supabase
      .from("profiles")
      .update({ full_name: fullName.trim() || null, phone: phone.trim() || null })
      .eq("id", user.id);

    setSaving(false);
    if (error) { setMsg(error.message); return; }
    setMsg("저장되었습니다.");
    router.refresh();
  }

  const inputCls = "w-full rounded-lg border border-[#dfe8e2] px-3 py-2.5 text-sm focus:border-[#166534] focus:outline-none";

  return (
    <div>
      <h2 className="text-lg font-semibold text-[#1a1f1c]">프로필</h2>
      <div className="mt-4 space-y-4">
        <div>
          <label className="mb-1 block text-xs font-medium text-[#374151]">이메일</label>
          <input type="email" value={email} disabled className={`${inputCls} bg-[#f4f6f5] text-[#9ca3a0]`} />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-[#374151]">이름</label>
          <input type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} className={inputCls} />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-[#374151]">연락처</label>
          <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="01012345678" className={inputCls} />
        </div>
        {msg ? <p className={`text-sm ${msg.includes("저장") ? "text-emerald-700" : "text-red-600"}`}>{msg}</p> : null}
        <button
          type="button"
          disabled={saving}
          onClick={() => void handleSave()}
          className="rounded-lg bg-[#166534] px-5 py-2.5 text-sm font-medium text-white hover:bg-[#14532d] disabled:opacity-50"
        >
          {saving ? "저장 중..." : "저장"}
        </button>
      </div>
    </div>
  );
}
