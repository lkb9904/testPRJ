import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { AuthShell } from "../auth/auth-shell";
import LoginForm from "./login-form";

export default async function LoginPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    redirect("/");
  }

  return (
    <AuthShell
      title="로그인"
      subtitle="이메일로 로그인하거나 Google 계정으로 연결할 수 있습니다."
    >
      <Suspense
        fallback={<p className="text-center text-sm text-[#5c6b63]">로딩…</p>}
      >
        <LoginForm />
      </Suspense>
    </AuthShell>
  );
}
