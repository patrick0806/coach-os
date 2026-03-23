# SYSTEM_STATUS.md — Coach OS

Last updated: 2026-03-23 (post Milestone 15)

---

## Backend Status

All backend modules are **functionally complete** (848 tests passing).

| Module | Status | Notes |
|--------|--------|-------|
| platform/auth | ok | |
| platform/admins | minor issues | Remaining: no min password length |
| platform/subscriptions | minor issues | Remaining: checkout session.url non-null assertion |
| platform/webhooks | ok | |
| platform/tenants | ok | |
| training | ok | youtubeUrl added to student program join (Milestone 15) |
| scheduling | ok | |
| coaching | ok | |
| students | ok | Remaining: TOCTOU race condition (accepted risk) |
| workoutExecution | ok | |
| progress | ok | |
| public | ok | |

---

## Frontend Status

| Area | Status | Notes |
|------|--------|-------|
| **Dashboard** | ok | layout + real stats integrated |
| **Onboarding Tutorial** | ok | Checklist hide fix + auth store sync (Milestone 15) |
| **Subdomain routing** | ok | Sprint 2+3 complete |
| **Progress charts** | ok | LineChart + CombinedProgressChart |
| **Reschedule appointments** | ok | RescheduleAppointmentDialog + conflict detection |
| **Reschedule training** | ok | TrainingScheduleDetailDialog + RescheduleTrainingDialog |
| **Student Portal** | ok | Login, training, progress, calendar |
| **Workout Execution Media** | ok | GIF/image + YouTube link in activeExerciseView (Milestone 15) |
| **Settings / Profile** | ok | Photo + phone in Settings, specialties + colors in Pagina Publica (Milestone 15) |
| **Training Schedule UI** | ok | Student Agenda tab with CRUD (Milestone 15) |
| **Notifications** | not started | Backlog (Milestone 14) |

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

## Milestones

### Milestone 13 — System Audit Fixes ✅ COMPLETE (2026-03-22)

All 5 waves implemented. 41 of 42 findings fixed (CHK-031 TOCTOU accepted as risk).

### Milestone 15 — UX Fixes + Training Schedule UI ✅ COMPLETE (2026-03-23)

1. **Exercise media in workout execution** — GIF/image + YouTube link rendered in student activeExerciseView
2. **Profile/Settings reorganization** — photo + phone moved to Settings, bio removed from UI, tab renamed to Aparencia
3. **Training schedule UI** — student Agenda tab enabled with full CRUD, weekly grid view, form dialog, delete confirmation

### Milestone 14 — Notifications (backlog)
- Email notifications via Resend (training reminders, session reminders, missed training)
- Notification preferences page
