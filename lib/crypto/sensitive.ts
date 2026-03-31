import { createCipheriv, createDecipheriv, randomBytes, scryptSync } from "node:crypto";

/**
 * 선택적 필드 단위 암호화 (at-rest 보강). Supabase 저장소 암호화와 별개.
 * FIELD_ENCRYPTION_KEY 가 없으면 no-op 스텁으로 동작하지 않고, 호출 시 에러.
 */

function getKey(): Buffer {
  const raw = process.env.FIELD_ENCRYPTION_KEY;
  if (!raw || raw.length < 32) {
    throw new Error(
      "FIELD_ENCRYPTION_KEY 가 설정되지 않았거나 너무 짧습니다 (32바이트 이상 권장).",
    );
  }
  return scryptSync(raw, "saemok-fruit-salt", 32);
}

export function encryptField(plain: string): string {
  const key = getKey();
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", key, iv);
  const enc = Buffer.concat([cipher.update(plain, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  return Buffer.concat([iv, tag, enc]).toString("base64url");
}

export function decryptField(payload: string): string {
  const key = getKey();
  const buf = Buffer.from(payload, "base64url");
  const iv = buf.subarray(0, 12);
  const tag = buf.subarray(12, 28);
  const data = buf.subarray(28);
  const decipher = createDecipheriv("aes-256-gcm", key, iv);
  decipher.setAuthTag(tag);
  return Buffer.concat([decipher.update(data), decipher.final()]).toString(
    "utf8",
  );
}
