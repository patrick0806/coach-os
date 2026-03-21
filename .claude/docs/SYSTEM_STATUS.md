# SYSTEM_STATUS.md — Coach OS

Last updated: 2026-03-21

---

## Backend Status

All backend modules are **completed** (775 tests passing).

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
| **Dashboard** | ✅ done | layout + real stats integrated |
| **Onboarding Tutorial** | ✅ done | Milestone 12 completo: backend (tour progress endpoints) + frontend (config, store, driver.js tours, checklist, header button) + 26 testes E2E passando |
| **Subdomain routing** | not started | Sprint 2+3: infra + Next.js proxy (proxy.ts) |
| **Progress charts** | not started | Backlog: line graphs, comparisons |
| **Notifications** | not started | Backlog: preferences page |

---

## Infrastructure

| Component | Status | Notes |
|-----------|--------|-------|
| **Error SDK** | ✅ done | Better Stack cobre logs + uptime + telemetria; Sentry descartado como redundante |
| **CI/CD** | ✅ done | GitHub Actions CI (lint, typecheck, tests) + CD (build GHCR, deploy SSH, cleanup old images) |
| **Monitoring** | ✅ done | OTel Collector + Beyla (eBPF auto-instrumentation) + Better Stack |
| **Wildcard DNS/SSL** | ✅ done | `*.coachos.com.br` configurado |
| **Nginx wildcard** | ✅ done | `*.coachos.com.br` → frontend |

---

## Next Milestones

### Milestone 10 — Subdomain Foundation (Sprints 2+3)
Cookies + CORS + Next.js proxy + migração de rotas.
- ~~Wildcard DNS e SSL (`*.coachos.com.br`)~~ ✅ done
- ~~Nginx wildcard config~~ ✅ done
- Backend: `COOKIE_DOMAIN` env + CORS regex
- Frontend: proxy.ts + migração de rotas `/coach/[slug]/`
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