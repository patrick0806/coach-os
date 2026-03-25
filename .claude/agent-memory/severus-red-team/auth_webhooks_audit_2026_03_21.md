---
name: Auth & Webhooks Security Audit
description: Deep security audit of Auth (M1) and Stripe Webhooks (M4) modules — findings, confirmed QA items, and new attack vectors discovered
type: project
---

## Auth Module (M1)

### Confirmed Findings
- **SEC-M1-001 (CRITICAL)**: register.controller.ts line 31 uses `personal.id` in refresh cookie instead of `user.id`. Login uses `user.id`. refreshToken.useCase.ts line 46 calls `findById(userId)` on UsersRepository — personal.id will NOT match any user, so refresh will always fail post-registration. Identity mismatch confirmed.
- **SEC-M1-002 (HIGH)**: refreshToken.useCase.ts has no ADMIN branch — line 123 throws "Unsupported role" for ADMIN. Admin tokens expire after 15min with no recovery path except re-login.
- **SEC-M1-003 (MEDIUM)**: requestPasswordReset.useCase.ts line 48 builds URL with `/personais/${slug}` — stale route (migrated to `/coach/${slug}` per Sprint 3).
- **SEC-M1-004 (HIGH)**: No rate limiting on ANY endpoint (login, register, password-reset). Confirmed via grep — zero throttle/rate-limit references in codebase.
- **SEC-M1-005 (HIGH)**: register.useCase.ts is NOT transactional — user created at line 78, Stripe call at line 97, personal created at line 114. Stripe or personal failure orphans the user row.
- **SEC-M1-006 (MEDIUM)**: jwt.strategy.ts validate() does zero post-issuance checks — deactivated/deleted user keeps valid JWT for up to 15min.

### New Findings
- **SEC-M1-007 (MEDIUM)**: refreshToken.controller.ts line 32 uses `cookieValue!.split(".")` after useCase already validated — but if useCase throws, the `!` non-null assertion is safe. However, the controller rebuilds the cookie prefix from the INCOMING cookie (which used `personal.id` in register), perpetuating the identity mismatch.
- **SEC-M1-008 (HIGH)**: CORS allows null origin in production (line 87: `if (!origin) return callback(null, true)`). Server-to-server requests and sandboxed iframes send null origin — this bypasses CORS entirely.
- **SEC-M1-009 (LOW)**: Cookie sameSite is "lax" in production (when COOKIE_DOMAIN is set). Combined with null origin CORS, this increases CSRF risk on state-changing POST endpoints.
- **SEC-M1-010 (INFO)**: JWT uses HS256 by default (passport-jwt). No explicit algorithm restriction in strategy — though NestJS/passport defaults are sane, explicit `algorithms: ['HS256']` would harden against algorithm confusion.
- **SEC-M1-011 (MEDIUM)**: `findByEmail` in UsersRepository has no tenantId filter (by design — email is global). But this means email enumeration is possible through ConflictException("Já existe um registro com esse email") in register.useCase.ts line 63.

### Patterns Observed (Positive)
- Timing-safe hash comparison in refresh token (crypto.timingSafeEqual)
- Argon2id with pepper for password hashing
- Dummy hash comparison on login to prevent timing-based user enumeration
- Refresh token rotation on every use
- Token reuse detection with immediate invalidation
- httpOnly + secure + path-scoped cookies

## Webhooks Module (M4)

### Confirmed Findings
- **SEC-M4-001 (CRITICAL)**: No idempotency protection. processStripeEvent.useCase.ts processes every event — no event ID dedup. Stripe retries deliver duplicates.
- **SEC-M4-002 (CRITICAL)**: No out-of-order protection. No timestamp/version comparison. A stale `subscription.updated` event can overwrite newer state.
- **SEC-M4-003 (HIGH)**: stripeWebhook.controller.ts line 22 falls back to `Buffer.alloc(0)` when rawBody is undefined. This means if rawBody capture fails, an empty buffer is passed to constructEvent — which will fail signature verification (good), but the error message may leak implementation details.

### New Findings
- **SEC-M4-004 (MEDIUM)**: `(invoice as any).next_payment_attempt` at line 213 — unsafe cast bypasses type safety. If Stripe API changes this field, runtime error goes unhandled.
- **SEC-M4-005 (LOW)**: Fire-and-forget email calls (lines 144, 185, etc.) — if resend fails, no retry, no logging of failure. Not a security issue per se, but operational visibility gap.

### Patterns Observed (Positive)
- Stripe signature verification via constructEvent
- Webhook secret from env, not hardcoded
- Structured logging of all webhook events
