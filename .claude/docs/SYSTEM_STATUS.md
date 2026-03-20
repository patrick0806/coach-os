# SYSTEM_STATUS.md — Coach OS

Last updated: 2026-03-20 (CI/CD + Observabilidade + Brand logo + Onboarding Tutorial planejado)

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
| **Onboarding Tutorial** | not started | Milestone 12: checklist no dashboard + driver.js in-place por página + botão no header; feature flag SHOW_TUTORIAL |
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

### Milestone 12 — Onboarding Tutorial
- Backend: migration `tour_completed_pages jsonb` em `personals` + endpoints `GET/POST /profile/tour-progress/:page`; auto-seta `onboarding_completed` quando todas as 8 páginas visitadas
- Backend: expor `onboardingCompleted` no login/register
- Frontend: feature flag `SHOW_TUTORIAL`; checklist no dashboard; driver.js tour in-place por página (8 módulos); botão "Tutorial" no header para rever a qualquer momento
- Estado sincronizado entre dispositivos via banco (localStorage apenas como cache)
- **Validates:** Coach novo se orienta sem suporte; tour pode ser desligado globalmente via env var

### Milestone 11 — Polish
- Dashboard real stats
- Progress charts (line graphs, comparisons)
- Notification preferences
- Error SDK (Sentry no NestJS + Next.js)
