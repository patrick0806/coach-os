# SYSTEM_STATUS.md — Coach OS

Last updated: 2026-03-18 (public page complete)

---

## Backend Status

| Module | Status | Notes |
|--------|--------|-------|
| **platform/admins** | not started | Next: admin guard, admin repository |
| **platform/subscriptions** | not started | Backlog: Stripe webhooks, plan changes |
| **platform/tenants** | not started | Backlog: admin tenant management |
| **progress/checkins** | completed | POST+GET /me/progress-checkins (student self-service), 626 tests passing |
| **progress/photos** | completed | POST /me/progress-photos/upload-url (student), 626 tests passing |
| **scheduling/appointments** | completed | GET /me/appointments (student), 626 tests passing |
| **scheduling/trainingSchedules** | completed | GET /me/training-schedules (student) + ownership validation |
| **public** | completed | GET /public/:slug now includes availabilityRules, 626 tests passing |

All other backend modules are **completed** (626 tests passing).

---

## Frontend Status

| Area | Status | Notes |
|------|--------|-------|
| **Dashboard** | in progress | layout + placeholder done; real sidebar nav + stats pending |
| **Public page** | completed | LP renderizada em /personais/[slug]; editor em /pagina-publica; sub-rotas auth branded |
| **Student portal** | completed | Layout + bottom nav, login, treinos, execução, progresso (/aluno/progresso) com criação própria, agenda (/aluno/agenda) |
| **Notifications** | not started | Backlog: preferences page |
| **Institutional Pages** | not started | Backlog: FAQ, Contact, Terms, Privacy, About |
| **Progress checkins** | completed | Unified checkin view (replaces Métricas + Fotos tabs); checkinCard, createCheckinDialog |
| **Progress charts** | not started | Backlog: line graphs, metric comparisons |

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

### Milestone 7 — Polish & Infrastructure
- Progress charts (line graphs, metric comparisons)
- Dashboard real stats
- Notification preferences
- CI/CD pipeline
