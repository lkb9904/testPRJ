/**
 * 인메모리 슬라이딩 윈도우 (Edge/단일 인스턴스).
 * 멀티 인스턴스·서버리스에서는 Upstash Redis 등 외부 저장소 권장 (SECURITY.md 참고).
 */

type Bucket = { timestamps: number[]; windowMs: number; max: number };

const store = new Map<string, Bucket>();

function prune(bucket: Bucket, now: number): void {
  const cutoff = now - bucket.windowMs;
  bucket.timestamps = bucket.timestamps.filter((t) => t > cutoff);
}

export function checkRateLimit(
  key: string,
  options: { windowMs: number; max: number },
): { ok: boolean; remaining: number } {
  const now = Date.now();
  let bucket = store.get(key);
  if (!bucket) {
    bucket = { timestamps: [], windowMs: options.windowMs, max: options.max };
    store.set(key, bucket);
  }
  prune(bucket, now);
  if (bucket.timestamps.length >= bucket.max) {
    return { ok: false, remaining: 0 };
  }
  bucket.timestamps.push(now);
  return { ok: true, remaining: bucket.max - bucket.timestamps.length };
}

export function getClientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0].trim();
  }
  return request.headers.get("x-real-ip") ?? "unknown";
}
