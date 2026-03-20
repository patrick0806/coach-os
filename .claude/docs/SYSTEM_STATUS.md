# SYSTEM_STATUS.md — Coach OS

Last updated: 2026-03-20 (CI/CD + Observabilidade + Brand logo)

---

## Backend Status

All backend modules are **completed** (758 tests passing).

| Module | Notes |
|--------|-------|
| platform/auth | login, register, refresh, password reset, setup |
| platform/admins | 14 contexts — stats, plans, whitelist, admins, tenants |
| platform/subscriptions | GET current, PATCH plan, POST cancel, POST portal |
| platform/webhooks | subscription.updated/deleted, invoice.paid/payment_failed, trial_will_end |
| platform/tenants | list, get, update status (admin only) |
| training | exercises, templates, student programs, execution |
| scheduling | availability rules/exceptions, appointments, training schedules, calendar |
| coaching | relations, service plans, contracts, notes, progress photos |
| students | invite, accept-invite, shareable link |
| progress | checkins (POST+GET /me), photos upload-url |
| public | GET /public/:slug (inclui availabilityRules) |
| enums | GET /enums/muscle-groups + /enums/attendance-types |

---

## Frontend Status

| Area | Status | Notes |
|------|--------|-------|
| **Dashboard** | in progress | layout + placeholder done; real stats pending |
| **Subdomain routing** | not started | Sprint 2+3: infra + Next.js proxy (proxy.ts) |
| **Progress charts** | not started | Backlog: line graphs, comparisons |
| **Notifications** | not started | Backlog: preferences page |

---

## Infrastructure

| Component | Status | Notes |
|-----------|--------|-------|
| **Error SDK** | not started | Applications criadas no Better Stack; Sentry SDK pendente de integração no código |
| **Wildcard DNS/SSL** | not started | Needed for subdomain routing (Sprint 2) — ver docs/SERVER_SETUP.md |
| **Nginx wildcard** | not started | `*.coachos.com.br` → frontend (Sprint 2) — config pronta em docs/SERVER_SETUP.md |

---

## Next Milestones

### Milestone 10 — Subdomain Foundation (Sprints 2+3)
Infra + cookies + CORS + Next.js middleware.
- Wildcard DNS e SSL (`*.coachos.com.br`)
- Backend: `COOKIE_DOMAIN` env + CORS regex
- Frontend: middleware + migração de rotas `/coach/[slug]/`
- Portal do aluno totalmente brandado via subdomínio
- **Validates:** White-label real, isolamento por subdomínio

### Milestone 11 — Polish
- Dashboard real stats
- Progress charts (line graphs, comparisons)
- Notification preferences
- Error SDK (Sentry no NestJS + Next.js)
