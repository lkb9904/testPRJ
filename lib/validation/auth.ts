import { z } from "zod";

/** SQLi 방지: 쿼리는 항상 파라미터 바인딩(Supabase). 입력은 스키마로 길이·형식 제한. */
export const emailSchema = z.string().trim().email().max(320);
export const passwordSchema = z.string().min(8).max(128);
export const optionalNameSchema = z.string().trim().max(120).optional();
