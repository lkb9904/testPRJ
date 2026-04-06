"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { createClient as createBrowserClient } from "@/lib/supabase/client";

type Address = {
  id: string;
  recipient_name: string | null;
  line1: string;
  line2: string | null;
  postal_code: string | null;
  phone: string | null;
  is_default: boolean;
};

export function AddressesClient({
  customerId,
  addresses: initial,
}: {
  customerId: string;
  addresses: Address[];
}) {
  const router = useRouter();
  const [addresses] = useState(initial);
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");
  const [line1, setLine1] = useState("");
  const [line2, setLine2] = useState("");
  const [postal, setPostal] = useState("");
  const [phone, setPhone] = useState("");
  const [saving, setSaving] = useState(false);

  async function handleAdd() {
    if (!line1.trim() || !name.trim()) return;
    setSaving(true);
    const supabase = createBrowserClient();
    await supabase.from("customer_addresses").insert({
      customer_id: customerId,
      recipient_name: name.trim(),
      line1: line1.trim(),
      line2: line2.trim() || null,
      postal_code: postal.trim() || null,
      phone: phone.trim() || null,
    });
    setSaving(false);
    setShowForm(false);
    setName(""); setLine1(""); setLine2(""); setPostal(""); setPhone("");
    router.refresh();
  }

  async function handleDelete(id: string) {
    const supabase = createBrowserClient();
    await supabase.from("customer_addresses").delete().eq("id", id);
    router.refresh();
  }

  const inputCls = "w-full rounded-lg border border-[#dfe8e2] px-3 py-2 text-sm focus:border-[#166534] focus:outline-none";

  return (
    <div>
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-[#1a1f1c]">배송지 관리</h2>
        <button
          type="button"
          onClick={() => setShowForm(!showForm)}
          className="rounded-full border border-[#166534] px-4 py-1.5 text-xs font-medium text-[#166534] hover:bg-[#f0fdf4]"
        >
          {showForm ? "취소" : "새 배송지"}
        </button>
      </div>

      {showForm ? (
        <div className="mt-4 rounded-xl border border-[#dfe8e2] bg-white p-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="수령인" className={inputCls} />
            <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="연락처" className={inputCls} />
          </div>
          <input type="text" value={line1} onChange={(e) => setLine1(e.target.value)} placeholder="주소" className={`${inputCls} mt-3`} />
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            <input type="text" value={line2} onChange={(e) => setLine2(e.target.value)} placeholder="상세주소" className={inputCls} />
            <input type="text" value={postal} onChange={(e) => setPostal(e.target.value)} placeholder="우편번호" className={inputCls} />
          </div>
          <button
            type="button"
            disabled={saving}
            onClick={() => void handleAdd()}
            className="mt-4 rounded-lg bg-[#166534] px-5 py-2 text-sm font-medium text-white hover:bg-[#14532d] disabled:opacity-50"
          >
            {saving ? "저장 중..." : "저장"}
          </button>
        </div>
      ) : null}

      {addresses.length === 0 && !showForm ? (
        <p className="mt-6 text-sm text-[#5c6b63]">등록된 배송지가 없습니다.</p>
      ) : (
        <ul className="mt-4 divide-y divide-[#eef2ee]">
          {addresses.map((a) => (
            <li key={a.id} className="flex items-start justify-between gap-3 py-4">
              <div>
                <p className="text-sm font-medium text-[#1a1f1c]">
                  {a.recipient_name}
                  {a.is_default ? (
                    <span className="ml-2 rounded bg-[#166534]/10 px-1.5 py-0.5 text-[10px] font-medium text-[#166534]">
                      기본
                    </span>
                  ) : null}
                </p>
                <p className="mt-0.5 text-sm text-[#5c6b63]">
                  {a.line1}{a.line2 ? `, ${a.line2}` : ""}{a.postal_code ? ` (${a.postal_code})` : ""}
                </p>
                {a.phone ? <p className="mt-0.5 text-xs text-[#9ca3a0]">{a.phone}</p> : null}
              </div>
              <button
                type="button"
                onClick={() => void handleDelete(a.id)}
                className="shrink-0 text-xs text-[#9ca3a0] hover:text-[#dc2626]"
              >
                삭제
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
