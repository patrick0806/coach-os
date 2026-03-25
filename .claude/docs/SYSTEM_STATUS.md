# SYSTEM_STATUS.md — Coach OS

Last updated: 2026-03-25 (post Scheduling Refactoring)

---

## Backend Status

All backend modules are **functionally complete** (878 tests passing — reduced from 903 due to old scheduling tests removed).

| Module | Status | Notes |
|--------|--------|-------|
| platform/auth | ok | +acceptCoachInvite endpoint |
| platform/admins | ok | +inviteCoach endpoint, coach invitation tokens |
| platform/subscriptions | minor issues | Remaining: checkout session.url non-null assertion |
| platform/webhooks | ok | |
| platform/tenants | ok | |
| training | ok | studentPrograms uses RecurringSlotsRepository |
| scheduling | ok | **Refactored**: 3 tables (working_hours, recurring_slots, calendar_events). Old 6-table model removed. |
| coaching | ok | |
| students | ok | TOCTOU race condition accepted risk |
| workoutExecution | ok | |
| progress | ok | |
| public | ok | Uses WorkingHoursRepository + RecurringSlotsRepository |

---

## Frontend Status

| Area | Status | Notes |
|------|--------|-------|
| **Dashboard** | ok | |
| **Onboarding Tutorial** | ok | |
| **Subdomain routing** | ok | |
| **Progress charts** | ok | LineChart + CombinedProgressChart |
| **Scheduling (calendar)** | ok | Refactored: working hours, recurring slots, calendar events, calendar pipeline |
| **Student Portal** | ok | Login, training, progress, calendar (uses /me/events + /me/recurring-slots) |
| **Workout Execution Media** | ok | GIF/image + YouTube link |
| **Settings / Profile** | ok | |
| **Recurring Slots UI** | ok | Student Agenda tab with CRUD (replaces Training Schedule UI) |
| **Mobile UX** | ok | Sidebar closes on nav, cards on students, tabs scroll fixed, time fields stacked, exercise actions visible, GIF padding, selector dialog overflow |
| **Notifications** | not started | Backlog (Milestone 14) |

---

## Infrastructure

| Component | Status | Notes |
|-----------|--------|-------|
| **Error SDK** | ok | Better Stack (logs + uptime + telemetria) |
| **CI/CD** | ok | GitHub Actions |
| **Monitoring** | ok | OTel Collector + Beyla + Better Stack |
| **Wildcard DNS/SSL** | ok | `*.coachos.com.br` |
| **Nginx wildcard** | ok | `*.coachos.com.br` -> frontend |
| **Rate Limiting** | ok | ThrottlerModule global (10/min, 50/10min) + stricter on auth endpoints |

---

## Backlog

### Milestone 14 — Notifications
- Email notifications via Resend (training reminders, session reminders, missed training)
- Notification preferences page
