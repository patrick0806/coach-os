# TASK_BOARD.md — Coach OS

Last updated: 2026-03-20 (CI/CD + Observabilidade + Brand logo)

---

## Backlog — Subdomínios (Milestone 10)

### Sprint 2 — Fundação de Subdomínios (infra + backend)

> Pré-requisito: DNS wildcard e Cloudflare configurados (ver docs/SERVER_SETUP.md)

**Infraestrutura**
- [ ] Configurar wildcard DNS `*.coachos.com.br → IP da VM`
- [ ] Obter wildcard SSL via Certbot + Cloudflare DNS (`*.coachos.com.br`)
- [ ] Nginx: adicionar `server_name *.coachos.com.br` apontando para frontend

**Backend — cookies**
- [ ] Adicionar `COOKIE_DOMAIN` em `backend/src/config/env/index.ts`
- [ ] Aplicar `domain: COOKIE_DOMAIN` no cookie `refreshToken` em `login.controller.ts`
- [ ] Aplicar `domain: COOKIE_DOMAIN` no cookie `refreshToken` em `register.controller.ts`
- [ ] Aplicar `domain: COOKIE_DOMAIN` no cookie `refreshToken` em `refreshToken.controller.ts`
- [ ] Aplicar `domain: COOKIE_DOMAIN` no cookie do student auth (login do aluno)

**Backend — CORS**
- [ ] Substituir lista hardcoded de origens em `main.ts` por função regex: `*.coachos.com.br`
- [ ] Manter `localhost` permitido para desenvolvimento local

**Frontend — cookies**
- [ ] Adicionar `domain` nos cookies escritos em `authCookies.ts`
- [ ] Adicionar `domain` nos cookies escritos em `studentAuthCookies.ts`

**Testes**
- [ ] Verificar manualmente: cookie de refresh enviado de `joao.coachos.com.br` para `api.coachos.com.br`
- [ ] Verificar CORS não bloqueia subdomínios novos

---

### Sprint 3 — Proxy Next.js + Migração de Rotas

> Pré-requisito: Sprint 2 concluído
> Next.js renomeou `middleware.ts` para `proxy.ts` (deprecation warning se usar o nome antigo)

**Proxy**
- [ ] Criar `frontend/src/proxy.ts` com detecção de subdomínio via `host` header
- [ ] Proxy reescreve `joao.coachos.com.br/*` → `/coach/joao/*` (transparente para o Next.js)
- [ ] Excluir `www`, `app`, `admin` da regra de rewrite (subdomínios reservados)

**Estrutura de rotas**
- [ ] Criar `src/app/coach/[slug]/page.tsx` (LP do coach — migrar de `/personais/[slug]`)
- [ ] Criar `src/app/coach/[slug]/aluno/layout.tsx` (layout com branding do coach)
- [ ] Migrar `src/app/(student)/aluno/*` → `src/app/coach/[slug]/aluno/*`
- [ ] Criar `src/app/coach/[slug]/login/page.tsx` (login do aluno brandado)
- [ ] Manter `/personais/[slug]` com redirect 301 → `[slug].coachos.com.br` (backward compat)

**Autenticação do aluno**
- [ ] Redirect pós-login do aluno: `[slug].coachos.com.br/aluno/treinos`
- [ ] Links de retorno no portal apontam para `[slug].coachos.com.br`

**Testes**
- [ ] Atualizar behavior tests: proxy rewrite funciona com mock de `host` header
- [ ] Smoke test: fluxo completo aluno em `joao.coachos.com.br/aluno/treinos`
- [ ] Verificar: `/personais/joao` redireciona 301 para `joao.coachos.com.br`

---

## Backlog — Onboarding Tutorial (Milestone 12)

> Feature flag: `SHOW_TUTORIAL=true` (backend) + `NEXT_PUBLIC_SHOW_TUTORIAL=true` (frontend).
> Se `false`, nenhum código de tutorial executa. Todo o módulo de onboarding deve checar essa flag antes de qualquer operação.

---

### Fase 1 — Backend

**Migração**
- [ ] Adicionar coluna `tour_completed_pages jsonb default '[]'` em `personals` via nova migration Drizzle

**Repository**
- [ ] Adicionar `getTourProgress(tenantId): Promise<string[]>` em `personals.repository.ts`
- [ ] Adicionar `markPageToured(tenantId, page): Promise<string[]>` em `personals.repository.ts` — retorna array atualizado e auto-seta `onboarding_completed = true` quando todas as 8 páginas estiverem presentes

**Contexts — getTourProgress**
- [ ] Criar `getTourProgress.useCase.spec.ts` (TDD)
- [ ] Criar `getTourProgress.useCase.ts`
- [ ] Criar `getTourProgress.controller.ts` — `GET /profile/tour-progress`, role PERSONAL

**Contexts — markPageToured**
- [ ] Criar `markPageToured.useCase.spec.ts` (TDD)
- [ ] Criar `markPageToured.useCase.ts` — valida que `page` é uma das 8 chaves válidas, idempotente
- [ ] Criar `markPageToured.controller.ts` — `POST /profile/tour-progress/:page`, role PERSONAL

**Module registration**
- [ ] Registrar os 2 novos controllers e useCases em `profile.module.ts`

**Expor onboardingCompleted no auth**
- [ ] Adicionar `onboardingCompleted` ao DTO e useCase de login (`login/dtos/response.dto.ts` + `login.useCase.ts`)
- [ ] Adicionar `onboardingCompleted` ao DTO e useCase de register (`register/dtos/response.dto.ts` + `register.useCase.ts`)
- [ ] Atualizar testes de login e register para asserir campo presente

**Validação**
- [ ] `npm run test` — todos os testes passando

---

### Fase 2 — Frontend (dados e config)

**Feature flag**
- [ ] Criar `frontend/src/features/onboarding/config.ts` — exporta `SHOW_TUTORIAL = process.env.NEXT_PUBLIC_SHOW_TUTORIAL === 'true'`

**Tipos e store**
- [ ] Adicionar `onboardingCompleted?: boolean` ao tipo `AuthUser` em `auth.types.ts`
- [ ] Adicionar `setOnboardingCompleted()` no `authStore.ts` (seta campo + regravar cookie `coach_os_user`)
- [ ] Mergear `onboardingCompleted` no `auth.service.ts` (login e register)

**Services e hooks**
- [ ] Adicionar `getTourProgress()` e `markPageToured(page)` em `profile.service.ts`
- [ ] Criar `frontend/src/features/onboarding/hooks/useTourProgress.ts` — React Query: busca `GET /profile/tour-progress`, mantém em cache + sincroniza localStorage
- [ ] Criar `frontend/src/features/onboarding/hooks/usePageTour.ts` — recebe chave da página, verifica SHOW_TUTORIAL + localStorage, dispara driver.js, chama `markPageToured` ao concluir/pular

---

### Fase 3 — Frontend (tours driver.js)

- [ ] Instalar `driver.js`
- [ ] Criar `frontend/src/features/onboarding/tours/exercises.tour.ts` (3–4 passos)
- [ ] Criar `frontend/src/features/onboarding/tours/students.tour.ts`
- [ ] Criar `frontend/src/features/onboarding/tours/training.tour.ts`
- [ ] Criar `frontend/src/features/onboarding/tours/schedule.tour.ts`
- [ ] Criar `frontend/src/features/onboarding/tours/availability.tour.ts`
- [ ] Criar `frontend/src/features/onboarding/tours/services.tour.ts`
- [ ] Criar `frontend/src/features/onboarding/tours/landingPage.tour.ts`
- [ ] Criar `frontend/src/features/onboarding/tours/profile.tour.ts`
- [ ] Integrar `usePageTour` em cada uma das 8 páginas de módulo

---

### Fase 4 — Frontend (UI checklist + header)

**Checklist no dashboard**
- [ ] Criar `frontend/src/features/onboarding/components/onboardingChecklist.tsx` — widget com os 8 itens, progresso e links para cada página; some quando `onboardingCompleted = true`
- [ ] Montar checklist em `frontend/src/app/(dashboard)/dashboard/page.tsx` (role PERSONAL + SHOW_TUTORIAL)

**Botão no header**
- [ ] Criar `frontend/src/features/onboarding/components/onboardingHeaderButton.tsx` — botão "Tutorial" que re-dispara `usePageTour` da página atual
- [ ] Montar botão em `frontend/src/app/(dashboard)/layout.tsx` (role PERSONAL + SHOW_TUTORIAL)

---

### Fase 5 — Testes E2E

- [ ] Criar `frontend/tests/e2e/fixtures/onboarding.fixtures.ts` (`MOCK_USER_NEW` com `onboardingCompleted: false`, `MOCK_USER_ONBOARDED`)
- [ ] Adicionar `mockGetTourProgress(page, completedPages)` e `mockMarkPageToured(page)` em `apiMocks.ts`
- [ ] Criar `frontend/tests/e2e/onboarding/onboarding.behavior.spec.ts`:
  - [ ] Checklist aparece quando `onboardingCompleted === false` e SHOW_TUTORIAL ativo
  - [ ] Checklist não aparece quando `onboardingCompleted === true`
  - [ ] Botão "Tutorial" no header aparece para PERSONAL, não aparece para ADMIN/STUDENT
  - [ ] Itens do checklist marcados refletem `completedPages` retornado pela API
  - [ ] `SHOW_TUTORIAL=false` → nenhum elemento de onboarding renderiza
- [ ] `npm run test:e2e` — behavioral tests passando

---

## Backlog — Outros

### Frontend: Dashboard stats reais
- [ ] Integrar dados reais na página `/dashboard` (hoje usa placeholders)

### Frontend: Progress charts
- [ ] Implementar gráficos de linha e comparativo de métricas do aluno

### Frontend: Notifications
- [ ] Implementar página de preferências de notificação

### Infrastructure: Error SDK
- [ ] Integrar Sentry SDK no NestJS — criar `backend/src/instrument.ts` + importar em `main.ts`
- [ ] Integrar Sentry SDK no Next.js — `npx @sentry/wizard -i nextjs`
- [ ] Usar DSNs documentados em `docs/OBSERVABILITY.md`

---

## Descartado

- **Tina CMS para editor de página** — não adequado: é Git-backed, dados estão no PostgreSQL, cria segunda fonte de verdade. Editor atual (form-based) é suficiente.
- **Custom domains (Sprint 5)** — complexidade muito alta. Avaliar somente após validação com coaches Elite.
