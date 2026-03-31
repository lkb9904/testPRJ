import { NextResponse } from "next/server";

/** 로드밸런서·모니터링용 — 내부 정보·버전 노출 없음 */
export async function GET() {
  return NextResponse.json(
    { ok: true, status: "up" },
    { status: 200, headers: { "Cache-Control": "no-store" } },
  );
}
