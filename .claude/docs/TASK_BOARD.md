# TASK_BOARD.md — Coach OS

Last updated: 2026-03-20 (CI/CD + Observabilidade + Brand logo)

---

## Concluído recentemente

### Brand Logo na UI ✅
- [x] Navbar (home + páginas institucionais): logo antes do texto "CoachOS" — desktop e mobile
- [x] Sidebar dashboard: substituído ícone dumbbell pelo logo (sem box colorido)
- [x] Header mobile dashboard: idem
- [x] Sidebar admin: idem
- [x] Painel de branding auth (login/cadastro): idem

### CI/CD — GitHub Actions ✅
- [x] `.github/workflows/ci.yml`: lint + typecheck + unit tests + db:migrate + integration tests (backend) e lint + typecheck + build + Playwright behavioral (frontend)
- [x] `.github/workflows/cd.yml`: build imagens GHCR (SHA + latest) + deploy via SSH — dispara somente quando CI passa em main
- [x] `docker-compose.yml`: adicionadas referências de imagem `ghcr.io/patrick0806/coach-os/backend:latest` e frontend
- [x] `docs/CICD.md`: documentação completa com branch protection, secrets, setup do servidor e rollback

### Observabilidade — Better Stack + eBPF ✅
- [x] Better Stack: 3 sources criadas (backend, frontend, infra) + 2 applications de error tracking
- [x] `docker-compose.yml`: serviços `otel-collector` e `beyla` adicionados com configuração eBPF
- [x] `monitoring/otel-collector.yml`: pipeline completo — docker_observer + receiver_creator + routing connector + hostmetrics + OTLP
- [x] `.env.example`: todos os tokens e DSNs documentados
- [x] `docs/OBSERVABILITY.md`: documentação completa com arquitetura, variáveis, onde cadastrar, alertas recomendados e próximos passos (SDK)

---

## Concluído recentemente

### Email Templates Premium ✅
- [x] Instalar `@react-email/components`, `@react-email/render`, `react`, `react-dom`
- [x] Configurar `"jsx": "react-jsx"` no tsconfig.json + TSX no include
- [x] Configurar SWC plugin no vite.config.ts para suporte a TSX
- [x] Criar componentes base: `emailLayout`, `emailButton`, `emailDetailCard`
- [x] Criar 13 templates: welcome, passwordResetRequest, passwordResetConfirm, planSubscribed, planChanged, planCancelled, accessLost, paymentFailed, paymentRetry, trialEndingSoon, studentInvite, studentPasswordSetup, studentPasswordResetConfirm
- [x] Refatorar `resend.provider.ts`: método `sendWithTemplate` + todos os novos métodos
- [x] Adicionar envio de email em: register, resetPassword, setupPassword, cancelSubscription, changePlan, processStripeEvent
- [x] Adicionar handler `customer.subscription.trial_will_end` no webhook Stripe
- [x] Atualizar módulos: SubscriptionsModule e WebhooksModule com ResendProvider/UsersRepository
- [x] Atualizar todos os testes afetados (758/758 passando)

---

## Concluído recentemente

### Página de Configurações — Alterar Senha ✅
- [x] Backend: `PATCH /auth/change-password` (autenticado) — verifica senha atual, hash nova, invalida sessões
- [x] Backend: 11 testes passando
- [x] Frontend: `authService.changePassword()`
- [x] Frontend: `useChangePassword` hook
- [x] Frontend: `ChangePasswordForm` component com show/hide toggle
- [x] Frontend: página `/settings`
- [x] Sidebar: link Configurações habilitado

---

## Backlog — White-label (Milestone 9–10)

### Sprint 1 — Quick Wins White-label (sem risco, sem impacto em auth/infra)

**LP editor — Draft/Publish system** ✅
- [x] Backend: coluna `lpDraftData` + migration 0007
- [x] Backend: `PUT /profile/lp-draft` (SaveLpDraftUseCase) — routing fix aplicado
- [x] Backend: `POST /profile/lp/publish` (PublishLpDraftUseCase) — routing fix aplicado
- [x] Frontend: profile.service.ts separado (UpdateProfileData vs LpDraftData)
- [x] Frontend: hooks useSaveLpDraft + usePublishLpDraft
- [x] Frontend: pageTab.tsx com botões "Salvar rascunho" / "Publicar" + badge "Rascunho pendente"
- [x] Frontend: pageTab.tsx com link "Visualizar rascunho" quando há draft
- [x] Frontend: profileTab.tsx com botão "Salvar" interno
- [x] Frontend: lpEditorPage.tsx com dois drafts separados
- [x] Frontend: pré-visualização do rascunho em `/pagina-publica/rascunho` (route group (preview))
- [x] Templates renomeados: Conversão, Autoridade, Minimalista, Impacto
- [x] Testes E2E atualizados — 68/68 passando (all browsers)

**LP pública — SEO** ✅
- [x] og:url, twitter:card, canonical
- [x] JSON-LD Person schema

**Portal do aluno — branding minor** ✅
- [x] Nav ativo com brand color (via CSS style inline)
- [x] "Treinando com [Nome]" abaixo do logo/nome
- [x] Footer "[Nome] · via Coach OS"

**LP pública (`/personais/[slug]`)** ✅
- [x] Exibir `specialties` como badges no hero da LP
- [x] Exibir `logoUrl` no hero da LP

**Testes** ✅
- [x] Atualizar behavior tests do studentPortal para cobrir branding (logo, cor)
- [x] Atualizar behavior tests da publicPage para cobrir specialties e logo

---

### Sprint 2 — Fundação de Subdomínios (infra + backend)

> Pré-requisito: DNS wildcard e Cloudflare configurados

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

## Backlog — Outros

### Frontend: progress charts
- [ ] Implement progress charts (line graphs, metric comparisons)

### Frontend: notifications
- [ ] Implement notification preferences page

### Infrastructure
- [x] ~~CI/CD pipeline~~ ✅ — ver docs/CICD.md
- [x] ~~Monitoring (Better Stack integration)~~ ✅ — ver docs/OBSERVABILITY.md
- [ ] Error SDK: integrar Sentry SDK no NestJS (`backend/src/instrument.ts`) e no Next.js (`npx @sentry/wizard -i nextjs`)

### Institutional Pages ✅
- [x] `/faq` — accordion por categoria + busca client-side + CTA para contato
- [x] `/contato` — formulário com feedback de sucesso + sidebar de info
- [x] `/termos` — documento legal com TOC lateral sticky (desktop)
- [x] `/privacidade` — política LGPD com TOC lateral sticky (desktop)
- [x] `/sobre` — brand story + valores + CTA
- [x] Footer expandido com links Produto / Empresa / Legal

---

## Descartado

- **Tina CMS para editor de página** — não adequado: é Git-backed, dados estão no PostgreSQL, cria segunda fonte de verdade. Editor atual (form-based) é suficiente.
- **Custom domains (Sprint 5)** — complexidade muito alta. Avaliar somente após validação com coaches Elite.
