# SYSTEM_STATUS.md — Coach OS

Last updated: 2026-03-20 (Email templates premium — React Email + 13 templates)

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
| **Billing / Subscription** | completed | /assinatura, /assinatura/bloqueado, trial banner, 403 interceptor |
| **Public page (LP)** | completed | /personais/[slug] + editor /pagina-publica + draft/publish system; SEO com og:url, twitter:card, JSON-LD |
| **Student portal** | completed | login, treinos, execução, progresso, agenda + bottom nav; branding com brand color nav, "Treinando com [Nome]", footer |
| **Admin panel** | completed | /admin/dashboard, /admin/planos, /admin/whitelist, /admin/admins, /admin/tenants |
| **Progress checkins** | completed | Unified checkin view (metrics + photos); behavior tests passing |
| **White-label branding** | partial | Portal do aluno: brand color nav + "Treinando com [Nome]" + footer. LP: specialties e logoUrl pendentes |
| **Subdomain routing** | not started | Sprint 2+3: infra + Next.js proxy (proxy.ts) |
| **Progress charts** | not started | Backlog: line graphs, comparisons |
| **Notifications** | not started | Backlog: preferences page |
| **Institutional Pages** | not started | Backlog: FAQ, Contact, Terms, Privacy, About |

---

## Infrastructure

| Component | Status | Notes |
|-----------|--------|-------|
| **CI/CD** | not started | No pipeline configured |
| **Monitoring** | not started | Better Stack planned |
| **Wildcard DNS/SSL** | not started | Needed for subdomain routing (Sprint 2) |
| **Nginx wildcard** | not started | `*.coachos.com.br` → frontend (Sprint 2) |

---

## Next Milestones

### Milestone 9 — White-label Quick Wins (Sprint 1)
Zero risco de regressão. Sem impacto em auth/infra.
- Exibir `specialties` como badges na LP do coach
- Exibir `logoUrl` no hero da LP
- Portal do aluno busca perfil via `/public/:slug` e aplica `themeColor` + `logoUrl`
- **Validates:** PRD Fase 6 (branding básico)

### Milestone 10 — Subdomain Foundation (Sprints 2+3)
Infra + cookies + CORS + Next.js middleware.
- Wildcard DNS e SSL (`*.coachos.com.br`)
- Backend: `COOKIE_DOMAIN` env + CORS regex
- Frontend: middleware + migração de rotas `/coach/[slug]/`
- Portal do aluno totalmente brandado via subdomínio
- **Validates:** White-label real, isolamento por subdomínio

### Milestone 11 — Polish & Infrastructure
- Progress charts (line graphs, comparisons)
- Dashboard real stats
- Notification preferences
- CI/CD pipeline
