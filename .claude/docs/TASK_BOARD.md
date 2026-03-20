# TASK_BOARD.md — Coach OS

Last updated: 2026-03-19 (LP editor draft/publish + SEO + branding minor)

---

## Em andamento

### Frontend: dashboard

- [ ] Implement real sidebar navigation
- [ ] Implement dashboard stats (real data from API)

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
- [ ] CI/CD pipeline
- [ ] Monitoring (Better Stack integration)

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
