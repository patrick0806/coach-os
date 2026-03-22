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

### Wave 3 — P2: Data Integrity + Security Hardening ✅ DONE (2026-03-21)

- [x] **CHK-017** Webhook idempotency — `webhook_events` table + dedup check in `processStripeEvent.useCase.ts`
- [x] **CHK-018** Webhook out-of-order — event.id stored before processing; duplicates skipped
- [x] **CHK-019** acceptInvite transactional — both branches (new/existing user) wrapped in `db.transaction()`
- [x] **CHK-020** Register transactional — user + Stripe + personal creation wrapped in `db.transaction()` with rollback
- [x] **CHK-021** approveRequest transactional — request update + appointment creation wrapped in `db.transaction()`
- [x] **CHK-022** assignProgram real transaction — `_tx` → `tx`, passed to all `.create()` calls inside transaction
- [x] **CHK-023** Reorder cross-entity — `reorder()` now takes `parentId` filter (programTemplateId / workoutTemplateId)
- [x] **CHK-024** Student cross-access — controllers pass `studentId` when role is STUDENT; use cases validate ownership
- [x] **CHK-025** Conflict detection respects exceptions — `detectConflicts()` now receives `trainingScheduleExceptions`, skips/reschedules applied
- [x] **CHK-026** Exercise execution on finished session — `createExecution.useCase.ts` checks `session.status === "started"`
- [x] **CHK-027** Record set on finished session — session status check + `setNumber` uniqueness via `existsByExecutionIdAndSetNumber`
- [x] **CHK-028** deleteAdmin orphan user — `deleteAdmin.useCase.ts` now also deletes the associated user record
- [x] **CHK-029** JWT algorithm restriction — `jwt.strategy.ts` now specifies `algorithms: ["HS256"]`
- [x] **CHK-030** sendStudentAccess Zod validation — `mode` parameter validated with `z.enum(["email", "link"])`

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
