import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { AuthShell } from "../auth/auth-shell";
import SignupForm from "./signup-form";

export default async function SignupPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    redirect("/dashboard");
  }

  return (
    <AuthShell
      title="회원가입"
      subtitle="이메일로 계정을 만들고 대시보드에서 주문·재고를 관리하세요."
    >
      <Suspense
        fallback={<p className="text-center text-sm text-[#5c6b63]">로딩…</p>}
      >
        <SignupForm />
      </Suspense>
    </AuthShell>
  );
}
