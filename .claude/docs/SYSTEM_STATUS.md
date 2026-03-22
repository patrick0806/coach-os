# SYSTEM_STATUS.md — Coach OS

Last updated: 2026-03-22

---

## Backend Status

All backend modules are **functionally complete** (795 tests passing).

Full system audit completed on 2026-03-22 — **73 findings** identified across 12 modules.

| Module | Status | Audit Findings |
|--------|--------|----------------|
| platform/auth | needs fixes | CRITICAL: register cookie uses wrong ID (personal.id vs user.id), admin refresh lockout, no rate limiting, register not transactional, CORS null origin bypass, URL regression in password reset email |
| platform/admins | needs fixes | HIGH: soft-delete plan breaks coaches on that plan, deleteAdmin leaves orphan user with ADMIN role, no min password length for admin creation |
| platform/subscriptions | needs fixes | CRITICAL: Stripe updated before DB (atomicity), downgrade accepts over-limit students. HIGH: checkout session.url non-null assertion |
| platform/webhooks | needs fixes | CRITICAL: no webhook idempotency (duplicate events processed), no out-of-order protection. HIGH: rawBody fallback Buffer.alloc(0) |
| platform/tenants | ok | No findings |
| training | needs fixes | HIGH: assignProgram fake transaction (_tx unused), reorder cross-entity no parent ID filter. MEDIUM: no status transition validation, duplicateProgramTemplate same pattern |
| scheduling | needs fixes | CRITICAL: appointment state machine broken (cancelled can be completed, completed can be cancelled). HIGH: approveRequest not transactional, conflict detection ignores training schedule exceptions, student can cancel other student's appointment |
| coaching | needs fixes | MEDIUM: createContract not transactional, deleteServicePlan with active contracts, contract for archived student |
| students | needs fixes | CRITICAL: acceptInvite fails for multi-tenant students (500). HIGH: student limit counts archived, TOCTOU race condition, acceptInvite not transactional, URL regression in sendStudentAccess |
| workoutExecution | needs fixes | HIGH: no status validation in finish/pause session, concurrent sessions allowed, exercise execution on finished session, recordSet on finished session |
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
| **Rate Limiting** | missing | No ThrottlerModule configured — all public endpoints unprotected |

---

## Audit Summary (2026-03-22)

Full system validation performed by QA, Security, and Code Review agents.

| Severity | Count | Status |
|----------|-------|--------|
| CRITICAL | 8 | 3 fixed (Wave 1), 5 pending |
| HIGH | 19 | 3 fixed (Wave 1), 16 pending |
| MEDIUM | 31 | pending fix |
| LOW | 15 | backlog |

### Wave 1 — P0 Fixes Applied (2026-03-22)

- **CHK-001**: `register.controller.ts` — cookie now uses `user.id` (was `personal.id`)
- **CHK-002**: `requestPasswordReset.useCase.ts` — URL now uses `/coach/` (was `/personais/`)
- **CHK-003**: `sendStudentAccess.useCase.ts` — URL now uses `/coach/` (was `/personais/`)
- **CHK-004**: `main.ts` — CORS now rejects null origin
- **CHK-005**: `completeAppointment.useCase.ts` — only `scheduled` status can be completed
- **CHK-006**: `cancelAppointment.useCase.ts` — only `scheduled` status can be cancelled

All 820 backend tests passing after fixes.

### Confirmed Bugs

1. `register.controller.ts:31` — uses `personal.id` instead of `user.id` in refresh cookie (breaks ALL new coaches)
2. `requestPasswordReset.useCase.ts:48` — URL uses `/personais/` (migrated to `/coach/`)
3. `sendStudentAccess.useCase.ts:44` — URL uses `/personais/` (migrated to `/coach/`)
4. `completeAppointment.useCase.ts` — cancelled appointments can be completed
5. `cancelAppointment.useCase.ts` — completed appointments can be cancelled
6. `acceptInvite.useCase.ts` — 500 error when student invited by 2 coaches (multi-tenant)
7. `students.repository.ts` — student limit counts archived students

### Systemic Patterns Detected

1. **Fake transactions**: `assignProgram` and `duplicateProgramTemplate` use `_tx` (unused) — operations run outside transaction
2. **Missing state machines**: No status transition validation in appointments, sessions, programs, contracts, relations
3. **Shallow ownership validation**: Queries filter by tenantId but not by parent entity (student can access other student's data within same tenant)
4. **No duplicate protection**: No idempotency in webhooks, no concurrent session prevention, no double-submit guards

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
