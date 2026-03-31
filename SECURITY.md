# 보안·에러 처리 체크리스트 (28항목 매핑)

이 문서는 요청하신 **Error Handling 6 + Security 22** 항목이 코드·인프라·운영 중 어디에 해당하는지 추적하기 위한 기준입니다.

## Error Handling (6)

| 항목 | 적용 내용 |
|------|-----------|
| **AppError** | `lib/errors/app-error.ts` — 코드·HTTP 상태·`publicMessage`와 내부 `causeDetail` 분리 |
| **전역 핸들러** | `instrumentation.ts`(Node 미처리 예외), `app/error.tsx`, `app/global-error.tsx` |
| **RequestID** | `middleware.ts`에서 `x-request-id` 생성·요청 헤더 전파·응답 헤더 설정 |
| **에러 노출 차단** | 대시보드 DB 오류는 일반 문구만 표시, 상세는 서버 로그(`lib/logger.ts`) |
| **구조화 로그** | `lib/logger.ts` — JSON 한 줄 로그, 민감 키 레드액션 |
| **에러 타입 분리** | `AppErrorCode` + `AppError` / 일반 `Error` 구분 |

## Security (22)

| 항목 | 적용 내용 |
|------|-----------|
| **CORS** | 브라우저 기본 동일 출처 + API는 동일 사이트 위주. 외부 오리진 허용 시 `ALLOWED_ORIGINS` 설정 |
| **CSRF** | `lib/security/origin.ts` — 변형 요청에 `Origin`/`Referer` 허용 목록 검사 + `SameSite=Lax` 쿠키 |
| **XSS + CSP** | `next.config.mjs`의 `Content-Security-Policy` 및 보안 헤더 |
| **SSRF** | `lib/security/ssrf.ts` — 서버에서 외부 URL fetch 시 호스트 검증용 |
| **AuthN / AuthZ** | Supabase Auth + `lib/auth/rbac.ts`(역할 조회) |
| **RBAC + 테넌트 격리** | `profiles.role` + RLS에서 `auth.uid()`·`is_staff()`로 행 단위 격리 (고객 데이터) |
| **최소 권한** | Supabase **anon / authenticated** 역할, 마이그레이션의 `REVOKE`·RLS 정책 |
| **Validation + SQLi** | Supabase 클라이언트는 파라미터 바인딩. 입력 검증은 API/서버 액션에서 Zod 등 권장 |
| **Rate Limit** | `lib/rate-limit/memory.ts` + `middleware.ts`(멀티 인스턴스 시 Redis/Upstash 권장) |
| **쿠키 / 세션** | `@supabase/ssr` `cookieOptions`: `httpOnly`, `secure`(production), `sameSite: lax` |
| **Secret 관리** | `.env` / 호스트 시크릿에만 보관, 코드·로그에 금지 (`lib/logger` 레드액션) |
| **보안 헤더** | `next.config.mjs` + `middleware.ts` 일부 (HSTS는 HTTPS 배포 시) |
| **AuditLog** | `supabase/migrations/20260331120000_security_audit.sql` — `audit_logs` + `log_audit()` RPC, `lib/audit.ts` |
| **의존성 점검** | `npm run security:audit` |
| **2FA / TOTP** | `/dashboard/security` + Supabase MFA API (`mfa-panel.tsx`), 대시보드에서 MFA 활성화 필요 |
| **자동 백업** | **Supabase 프로젝트** 대시보드 → Database → Backups(PITR 등). 앱 코드 아님 |
| **세션 타임아웃** | JWT 만료는 Supabase 설정 + `SessionIdleGuard`(`NEXT_PUBLIC_SESSION_IDLE_MS`) |
| **DB 권한 분리** | Supabase에서 **service_role**은 서버 전용, 클라이언트는 **anon key**만 |
| **RLS** | `20260331000000_dashboard.sql` 등 마이그레이션 정책 유지 |
| **민감 필드 로깅** | `lib/logger.ts` 레드액션, 감사 로그 `metadata`에 비밀번호·토큰 금지 |
| **별도 권한** | 스태프 전용 테이블/정책(`is_staff()`), 감사 로그 조회 동일 |
| **암호화** | 저장소 암호화는 Supabase 인프라. 필드 단위는 `lib/crypto/sensitive.ts` + `FIELD_ENCRYPTION_KEY` |

## 운영 필수 설정

1. **프로덕션** `ALLOWED_ORIGINS` 또는 `NEXT_PUBLIC_SITE_URL` 기준으로 CSRF 허용 출처 명시.
2. **Supabase Auth**: 이메일/OAuth/MFA·레이트 리밋·JWT 만료 시간.
3. **필드 암호화** 사용 시 32바이트 이상 `FIELD_ENCRYPTION_KEY` 설정.
4. **감사 마이그레이션** `20260331120000_security_audit.sql` 적용 후 `log_audit` RPC 사용 가능.

## 알려진 제한

- **인메모리 Rate limit**은 단일 인스턴스 기준. Vercel 등 다중 워커에서는 외부 저장소 기반 제한 권장.
- **CSP**에 `unsafe-inline`이 포함되어 있음(Next/React 호환). 엄격화 시 nonce 기반으로 개선 가능.
- **자동 백업**은 호스팅(Supabase) 구성으로 처리.
