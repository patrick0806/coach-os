# SYSTEM_STATUS.md — Coach OS

Last updated: 2026-03-21

---

## Backend Status

All backend modules are **functionally complete** (795 tests passing).

Full system audit completed on 2026-03-22 — **73 findings** identified across 12 modules.

| Module | Status | Audit Findings |
|--------|--------|----------------|
| platform/auth | needs fixes | Fixed: register cookie, CORS, URL regression, admin refresh, rate limiting. Remaining: register not transactional |
| platform/admins | needs fixes | Fixed: soft-delete plan guard. Remaining: deleteAdmin orphan user, no min password length |
| platform/subscriptions | needs fixes | Fixed: Stripe atomicity, downgrade validation. Remaining: checkout session.url non-null assertion |
| platform/webhooks | needs fixes | Fixed: rawBody fallback. Remaining: no webhook idempotency, no out-of-order protection |
| platform/tenants | ok | No findings |
| training | needs fixes | HIGH: assignProgram fake transaction (_tx unused), reorder cross-entity no parent ID filter. MEDIUM: no status transition validation, duplicateProgramTemplate same pattern |
| scheduling | needs fixes | CRITICAL: appointment state machine broken (cancelled can be completed, completed can be cancelled). HIGH: approveRequest not transactional, conflict detection ignores training schedule exceptions, student can cancel other student's appointment |
| coaching | needs fixes | MEDIUM: createContract not transactional, deleteServicePlan with active contracts, contract for archived student |
| students | needs fixes | Fixed: multi-tenant invite, student limit, URL regression. Remaining: TOCTOU race condition, acceptInvite not transactional |
| workoutExecution | needs fixes | Fixed: session state machine, concurrent sessions. Remaining: exercise execution on finished session, recordSet on finished session |
| progress | minor issues | MEDIUM: savePhoto accepts any URL, metricType free-text vs enum mismatch |
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
| CRITICAL | 8 | 3 fixed (Wave 1), 5 fixed (Wave 2) |
| HIGH | 19 | 3 fixed (Wave 1), 11 fixed (Wave 2), 5 pending |
| MEDIUM | 31 | pending fix |
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

### Systemic Patterns Remaining

1. **Fake transactions**: `assignProgram` and `duplicateProgramTemplate` use `_tx` (unused) — operations run outside transaction
2. **Shallow ownership validation**: Queries filter by tenantId but not by parent entity (student can access other student's data within same tenant)
3. **No webhook idempotency**: No event.id dedup in webhook processing

---

## Next Milestones

### Milestone 13 — System Audit Fixes (current)

Audit fixes organized in 4 waves:
- **Wave 1 (P0)**: 6 trivial fixes — broken functionality + security (register cookie, URL regressions, CORS, state machine)
- **Wave 2 (P1)**: 10 business-critical fixes — admin refresh, rate limiting, downgrade validation, multi-tenant invite, student limit, atomicity
- **Wave 3 (P2)**: 14 data integrity + security hardening fixes — webhook idempotency, transactions, ownership validation, reorder security
- **Wave 4 (P3)**: 8 nice-to-have / accepted risks — TOCTOU, calendar perf, timezone, S3 cleanup

### Milestone 14 — Notifications (backlog)
- Email notifications via Resend (training reminders, session reminders, missed training)
- Notification preferences page
