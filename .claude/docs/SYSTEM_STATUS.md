# SYSTEM_STATUS.md — Coach OS

Last updated: 2026-03-18 (admin module complete)

---

## Backend Status

| Module | Status | Notes |
|--------|--------|-------|
| **platform/admins** | completed | AdminsRepository + AdminModule with 14 contexts — 731 tests passing |
| **platform/subscriptions** | completed | GET /subscriptions/current, PATCH /subscriptions/plan, POST /subscriptions/cancel, POST /subscriptions/portal — 731 tests passing |
| **platform/webhooks** | completed | POST /webhooks/stripe — handles subscription.updated, subscription.deleted, invoice.paid, invoice.payment_failed — 731 tests passing |
| **platform/tenants** | completed | GET /admin/tenants, GET /admin/tenants/:id, PATCH /admin/tenants/:id/status — 731 tests passing |
| **progress/checkins** | completed | POST+GET /me/progress-checkins (student self-service), 626 tests passing |
| **progress/photos** | completed | POST /me/progress-photos/upload-url (student), 626 tests passing |
| **scheduling/appointments** | completed | GET /me/appointments (student), 626 tests passing |
| **scheduling/trainingSchedules** | completed | GET /me/training-schedules (student) + ownership validation |
| **public** | completed | GET /public/:slug now includes availabilityRules, 626 tests passing |
| **enums** | completed | GET /enums/muscle-groups + /enums/attendance-types (protected, 24h cache), 638 tests passing |

All other backend modules are **completed** (731 tests passing).

---

## Frontend Status

| Area | Status | Notes |
|------|--------|-------|
| **Dashboard** | in progress | layout + placeholder done; real sidebar nav + stats pending |
| **Billing / Subscription** | completed | /assinatura (plan cards, status, change/cancel dialogs), /assinatura/bloqueado (paywall), trial banner, sidebar link |
| **Public page** | completed | LP renderizada em /personais/[slug]; editor em /pagina-publica; sub-rotas auth branded |
| **Student portal** | completed | Layout + bottom nav, login, treinos, execução, progresso (/aluno/progresso) com criação própria, agenda (/aluno/agenda) |
| **Notifications** | not started | Backlog: preferences page |
| **Institutional Pages** | not started | Backlog: FAQ, Contact, Terms, Privacy, About |
| **Progress checkins** | completed | Unified checkin view (replaces Métricas + Fotos tabs); checkinCard, createCheckinDialog |
| **Progress charts** | not started | Backlog: line graphs, metric comparisons |

| **Admin panel** | completed | /admin/dashboard, /admin/planos, /admin/whitelist, /admin/admins, /admin/tenants + behavior tests |

All other frontend areas are **completed**.

---

## Infrastructure

| Component | Status | Notes |
|-----------|--------|-------|
| **CI/CD** | not started | No pipeline configured |
| **Monitoring** | not started | Better Stack planned but not integrated |

All other infrastructure components are **completed**.

---

## Next Milestones

### Milestone 6 — Student-facing product ✅ (portal completo)
- ~~Student portal: progress page + appointments page~~ — concluído
- ~~Coach public page and branding (editor + rendering)~~ — concluído
- Notifications — backlog
- **Validates:** Phases 11, 12, 13

### Milestone 7 — Billing & Subscription ✅
- ~~Stripe webhooks (subscription.updated, deleted, invoice.paid, payment_failed)~~ — concluído
- ~~Subscription endpoints (GET current, PATCH plan, POST cancel, POST portal)~~ — concluído
- ~~Frontend billing page (/assinatura)~~ — concluído
- ~~Paywall page + 403 interceptor~~ — concluído
- ~~Trial banner in dashboard layout~~ — concluído

### Milestone 8 — Polish & Infrastructure
- Progress charts (line graphs, metric comparisons)
- Dashboard real stats
- Notification preferences
- CI/CD pipeline
