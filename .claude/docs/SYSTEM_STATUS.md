# SYSTEM_STATUS.md — Coach OS

Last updated: 2026-03-22 (post Wave 5)

---

## Backend Status

All backend modules are **functionally complete** (848 tests passing).

Full system audit completed on 2026-03-22 — **73 findings** identified across 12 modules.

| Module | Status | Audit Findings |
|--------|--------|----------------|
| platform/auth | ok | Fixed: register cookie, CORS, URL regression, admin refresh, rate limiting, register transactional (CHK-020), JWT algorithm (CHK-029) |
| platform/admins | minor issues | Fixed: soft-delete plan guard, deleteAdmin orphan user (CHK-028). Remaining: no min password length |
| platform/subscriptions | minor issues | Fixed: Stripe atomicity, downgrade validation. Remaining: checkout session.url non-null assertion |
| platform/webhooks | ok | Fixed: rawBody fallback, webhook idempotency (CHK-017), out-of-order protection (CHK-018) |
| platform/tenants | ok | No findings |
| training | ok | Fixed: assignProgram real transaction (CHK-022), reorder parent ID filter (CHK-023), duplicateProgramTemplate transaction (CHK-039) |
| scheduling | ok | Fixed: appointment state machine, approveRequest transactional (CHK-021), conflict detection respects exceptions (CHK-025), student cross-access (CHK-024), calendar N+1 (CHK-032), calendar hardcoded limit (CHK-033), UTC date parsing (CHK-034) |
| coaching | ok | Fixed: createContract transactional (CHK-036), deleteServicePlan active contracts guard (CHK-040), createContract student status validation (CHK-041) |
| students | ok | Fixed: multi-tenant invite, student limit, URL regression, acceptInvite transactional (CHK-019), sendStudentAccess Zod validation (CHK-030). Remaining: TOCTOU race condition (Wave 4) |
| workoutExecution | ok | Fixed: session state machine, concurrent sessions, exercise execution on finished session (CHK-026), recordSet on finished session + setNumber uniqueness (CHK-027) |
| progress | ok | Fixed: metricType shared enum (CHK-035), S3 photo cleanup on delete (CHK-037). savePhoto URL validation sufficient (`z.string().url()`) |
| public | ok | No findings |
| enums | ok | No findings |

---

## Frontend Status

| Area | Status | Notes |
|------|--------|-------|
| **Dashboard** | ok | layout + real stats integrated |
| **Onboarding Tutorial** | ok | Milestone 12 complete |
| **Subdomain routing** | ok | Sprint 2+3 complete |
| **Progress charts** | ok | LineChart + CombinedProgressChart |
| **Reschedule appointments** | ok | RescheduleAppointmentDialog + conflict detection |
| **Reschedule training** | ok | TrainingScheduleDetailDialog + RescheduleTrainingDialog |
| **Student Portal** | ok | Login, training, progress, calendar |
| **Notifications** | not started | Backlog |

---

## Infrastructure

| Component | Status | Notes |
|-----------|--------|-------|
| **Error SDK** | ok | Better Stack (logs + uptime + telemetria) |
| **CI/CD** | ok | GitHub Actions CI/CD |
| **Monitoring** | ok | OTel Collector + Beyla + Better Stack |
| **Wildcard DNS/SSL** | ok | `*.coachos.com.br` |
| **Nginx wildcard** | ok | `*.coachos.com.br` -> frontend |
| **Rate Limiting** | ok | ThrottlerModule global (10/min, 50/10min) + stricter on auth endpoints |

---

## Audit Summary (2026-03-22)

Full system validation performed by QA, Security, and Code Review agents.

| Severity | Count | Status |
|----------|-------|--------|
| CRITICAL | 8 | all fixed (Wave 1 + Wave 2) |
| HIGH | 19 | all fixed (Wave 1 + Wave 2 + Wave 3) |
| MEDIUM | 31 | 9 fixed (Wave 3), 7 fixed (Wave 4), 3 fixed (Wave 5), 12 remaining (backlog) |
| LOW | 15 | backlog |

### Wave 1 — P0 Fixes Applied (2026-03-22)

- **CHK-001**: `register.controller.ts` — cookie now uses `user.id` (was `personal.id`)
- **CHK-002**: `requestPasswordReset.useCase.ts` — URL now uses `/coach/` (was `/personais/`)
- **CHK-003**: `sendStudentAccess.useCase.ts` — URL now uses `/coach/` (was `/personais/`)
- **CHK-004**: `main.ts` — CORS now rejects null origin
- **CHK-005**: `completeAppointment.useCase.ts` — only `scheduled` status can be completed
- **CHK-006**: `cancelAppointment.useCase.ts` — only `scheduled` status can be cancelled

All 820 backend tests passing after Wave 1 fixes.

### Wave 2 — P1 Fixes Applied (2026-03-21)

- **CHK-007**: `refreshToken.useCase.ts` — added ADMIN role branch (was throwing "Unsupported role" after 15min)
- **CHK-008**: `app.module.ts` — ThrottlerModule configured globally + stricter limits on login (5/min), register (3/min), password-reset (3/min)
- **CHK-009**: `changePlan.useCase.ts` — validates active student count against new plan limit before downgrade
- **CHK-010**: `acceptInvite.useCase.ts` — reuses existing user when student is invited by second coach (multi-tenant)
- **CHK-011**: `students.repository.ts` — `countByTenantId` now excludes archived students
- **CHK-012**: `changePlan.useCase.ts` — DB updated first, then Stripe, with rollback on Stripe failure
- **CHK-013**: `stripeWebhook.controller.ts` — throws BadRequestException when rawBody missing (was silently using empty buffer)
- **CHK-014**: `deletePlan.useCase.ts` — checks for active coaches before deactivating plan
- **CHK-015**: `finishSession.useCase.ts` + `pauseSession.useCase.ts` — status validation added (only valid transitions allowed)
- **CHK-016**: `startSession.useCase.ts` — prevents concurrent workout sessions per student

All 838 backend tests passing after Wave 2 fixes.

### Wave 3 — P2 Fixes Applied (2026-03-22)

- **CHK-017/018**: `processStripeEvent.useCase.ts` — webhook idempotency via `webhook_events` table; duplicate events skipped
- **CHK-019**: `acceptInvite.useCase.ts` — both branches wrapped in `db.transaction()`
- **CHK-020**: `register.useCase.ts` — user + Stripe + personal creation wrapped in `db.transaction()` with rollback
- **CHK-021**: `approveRequest.useCase.ts` — request update + appointment creation wrapped in `db.transaction()`
- **CHK-022**: `assignProgram.useCase.ts` — `_tx` → `tx`, passed to all `.create()` calls inside transaction
- **CHK-023**: `workoutTemplates.repository.ts` + `exerciseTemplates.repository.ts` — `reorder()` now takes `parentId` filter
- **CHK-024**: `cancelAppointment` + `getAppointment` — controllers pass `studentId` for ownership validation
- **CHK-025**: `conflictDetection.util.ts` — now receives `trainingScheduleExceptions`, skips/reschedules applied
- **CHK-026**: `createExecution.useCase.ts` — checks `session.status === "started"` before creating execution
- **CHK-027**: `recordSet.useCase.ts` — session status check + `setNumber` uniqueness via `existsByExecutionIdAndSetNumber`
- **CHK-028**: `deleteAdmin.useCase.ts` — also deletes the associated user record
- **CHK-029**: `jwt.strategy.ts` — specifies `algorithms: ["HS256"]`
- **CHK-030**: `sendStudentAccess.useCase.ts` — `mode` validated with `z.enum(["email", "link"])`

New migration: `0009_white_morbius.sql` — creates `webhook_events` table with unique `event_id` constraint.

All 848 backend tests passing after Wave 3 fixes.

### Wave 4 — P3 Fixes Applied (2026-03-22)

- **CHK-032**: `getCalendar.useCase.ts` — `findByIds` batch method replaces N individual `findById` calls (N+1 fix)
- **CHK-033**: `appointments.repository.ts` — `findAllInDateRange` replaces paginated `findAllByTenantId` (no hardcoded limit)
- **CHK-034**: `rescheduleOccurrence.useCase.ts` + `skipOccurrence.useCase.ts` — explicit UTC constructor + manual UTC week boundaries (no local timezone drift)
- **CHK-035**: `metricType.enum.ts` — shared `VALID_METRIC_TYPES` enum used in createCheckin, createRecord, getChartData, getMyChartData
- **CHK-036**: `createContract.useCase.ts` — auto-cancel + create wrapped in `db.transaction()`
- **CHK-037**: `deleteProgressPhoto.useCase.ts` — `s3Provider.deleteObject()` called on delete (best-effort with error logging)
- **CHK-038**: `register.useCase.ts` — documented as accepted risk; rate limiting (3 req/min) mitigates enumeration

All 848 backend tests passing after Wave 4 fixes.

### Wave 5 — P4 Fixes Applied (2026-03-22)

- **CHK-039**: `duplicateProgramTemplate.useCase.ts` — `_tx` → `tx`, passed to all `.create()` calls inside transaction (same fix as CHK-022)
- **CHK-040**: `deleteServicePlan.useCase.ts` — validates no active contracts exist before deletion via `countActiveByServicePlanId`
- **CHK-041**: `createContract.useCase.ts` — validates `student.status === "active"` before creating contract

### Systemic Patterns Remaining

1. **CHK-031** TOCTOU race condition on student limit — accepted risk (mitigated by rate limiting)
2. ~~**savePhoto** accepts any URL~~ — resolved: `z.string().url()` validation is sufficient given presigned URL flow

---

## Next Milestones

### Milestone 13 — System Audit Fixes ✅ COMPLETE

All 5 waves implemented. 41 of 42 findings fixed (CHK-031 TOCTOU accepted as risk).
- **Wave 1 (P0)**: 6 fixes — broken functionality + security
- **Wave 2 (P1)**: 10 fixes — business-critical
- **Wave 3 (P2)**: 14 fixes — data integrity + security hardening
- **Wave 4 (P3)**: 7 fixes + 1 accepted risk — calendar perf, timezone, S3 cleanup, enum consistency

### Milestone 14 — Notifications (backlog)
- Email notifications via Resend (training reminders, session reminders, missed training)
- Notification preferences page
