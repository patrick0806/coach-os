# TASK_BOARD.md — Coach OS

Last updated: 2026-03-21

---

## Milestone 13 — System Audit Fixes

> Full system audit performed on 2026-03-22.
> 73 findings across 12 modules. Organized in 4 waves by priority.

---

### Wave 1 — P0: Broken Functionality + Security (trivial fixes) ✅ DONE (2026-03-22)

- [x] **CHK-001** Register cookie identity mismatch — `register.controller.ts:31` changed `personal.id` to `user.id`
- [x] **CHK-002** URL regression in password reset email — `requestPasswordReset.useCase.ts:48` changed `/personais/` to `/coach/`
- [x] **CHK-003** URL regression in student access email — `sendStudentAccess.useCase.ts:44` changed `/personais/` to `/coach/`
- [x] **CHK-004** CORS null origin bypass — `main.ts:87` now rejects null origin
- [x] **CHK-005** Appointment state machine: only `scheduled` can be completed — guard `status !== "scheduled"`
- [x] **CHK-006** Appointment state machine: only `scheduled` can be cancelled — guard `status !== "scheduled"`

---

### Wave 2 — P1: Business-Critical Fixes ✅ DONE (2026-03-21)

- [x] **CHK-007** Admin refresh token lockout — added ADMIN role branch in `refreshToken.useCase.ts`
- [x] **CHK-008** Rate limiting — installed `@nestjs/throttler`, global ThrottlerGuard + stricter limits on login/register/password-reset
- [x] **CHK-009** Downgrade without student limit check — `changePlan.useCase.ts` now validates active students vs new plan limit
- [x] **CHK-010** acceptInvite multi-tenant failure — reuses existing user when student invited by second coach
- [x] **CHK-011** Student limit counts archived — `countByTenantId` now excludes archived students
- [x] **CHK-012** Stripe before DB atomicity — DB updated first, Stripe second, with rollback on Stripe failure
- [x] **CHK-013** Webhook rawBody fallback — throws BadRequestException when rawBody is missing
- [x] **CHK-014** Soft-delete plan breaks coaches — checks for active coaches before deactivating plan
- [x] **CHK-015** Session state machine — finishSession only from started/paused, pauseSession only from started
- [x] **CHK-016** Concurrent workout sessions — checks for existing active session before starting new one

---

### Wave 3 — P2: Data Integrity + Security Hardening

- [ ] **CHK-017** Webhook idempotency — `processStripeEvent.useCase.ts` no event.id dedup; duplicate events processed fully
- [ ] **CHK-018** Webhook out-of-order — `processStripeEvent.useCase.ts` stale events can overwrite newer state
- [ ] **CHK-019** acceptInvite not transactional — `acceptInvite.useCase.ts:66-89` 4 sequential operations without DB transaction; partial failure leaves orphan records
- [ ] **CHK-020** Register not transactional — `register.useCase.ts:78-124` user created before Stripe call; failure leaves orphan user blocking re-registration
- [ ] **CHK-021** approveRequest not transactional — `approveRequest.useCase.ts:94` request set to "approved" but appointment creation can fail, leaving orphaned state
- [ ] **CHK-022** assignProgram fake transaction — `assignProgram.useCase.ts:55` uses `_tx` (unused); snapshot operations run outside transaction, partial program possible
- [ ] **CHK-023** Reorder cross-entity — `workoutTemplates.repository.ts:97` UPDATE has no parent ID filter; IDs from other programs/tenants could be reordered
- [ ] **CHK-024** Student cross-access — `cancelAppointment.controller.ts:29` student can cancel/view other student's appointments within same tenant
- [ ] **CHK-025** Conflict detection ignores exceptions — `conflictDetection.util.ts:90` skipped training schedules still generate false conflicts
- [ ] **CHK-026** Exercise execution on finished session — `createExecution.useCase.ts` no session status check
- [ ] **CHK-027** Record set on finished session — `recordSet.useCase.ts` no session status check, no setNumber uniqueness
- [ ] **CHK-028** deleteAdmin orphan user — `deleteAdmin.useCase.ts` deletes admin record but leaves user with ADMIN role and valid credentials
- [ ] **CHK-029** JWT algorithm restriction — `jwt.strategy.ts:11` doesn't specify `algorithms: ['HS256']`
- [ ] **CHK-030** sendStudentAccess no Zod validation — `sendStudentAccess.useCase.ts` mode parameter has no Zod validation (only TypeScript typing)

---

### Wave 4 — P3: Backlog / Accepted Risks

- [ ] **CHK-031** TOCTOU race condition on student limit — affects createStudent, inviteStudent, generateInviteLink, acceptInvite; requires pessimistic lock (accepted risk for now)
- [ ] **CHK-032** Calendar N+1 queries — `getCalendar.useCase.ts` loops through studentIds with individual queries
- [ ] **CHK-033** Calendar hardcoded limit — `getCalendar.useCase.ts` uses `size: 1000`; events beyond silently dropped
- [ ] **CHK-034** parseISO timezone issue — `rescheduleOccurrence.useCase.ts` and `skipOccurrence.useCase.ts` may misinterpret dates on UTC+N servers
- [ ] **CHK-035** metricType free-text vs enum — `createCheckin` accepts any string but chart endpoint validates against fixed enum
- [ ] **CHK-036** createContract not transactional — auto-cancel + create without DB transaction; race condition possible
- [ ] **CHK-037** S3 photos never cleaned — `deletePhoto` removes DB record but photo stays in S3 indefinitely
- [ ] **CHK-038** Email enumeration via register — `/register` returns 409 for existing email (vs 201 for new), enabling enumeration

---

## Backlog — Notifications (Milestone 14)

- [ ] Implementar notificacoes por email (Resend): lembretes de treino, sessao, treino nao realizado
- [ ] Implementar pagina de preferencias de notificacao

---

## Descartado

- **Tina CMS para editor de pagina** — nao adequado; dados estao no PostgreSQL, cria segunda fonte de verdade
- **Custom domains (Sprint 5)** — complexidade muito alta; avaliar apos validacao com coaches Elite
- **Sentry Error SDK** — descartado; Better Stack ja cobre logs, uptime e telemetria
