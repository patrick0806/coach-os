# Coach OS — Task Board

> **Revisao Arquitetural concluida** — ver [architectural-review.md](architectural-review.md) antes de iniciar qualquer implementacao.
> Decisoes criticas: schema reiniciado, auth unificado, tenant isolation via JWT + repository layer.

## Status Legend
- `[ ]` todo
- `[~]` in progress
- `[x]` done
- `[!]` blocked

## Epics

| Epic | Arquivo | Backend | Frontend |
|------|---------|---------|----------|
| Revisao Arquitetural | [architectural-review.md](architectural-review.md) | [x] | [x] |
| 01 - Autenticacao e Fundacao | [epic-01-auth.md](epic-01-auth.md) | [x] | [x] |
| 02 - Perfil e Landing Page | [epic-02-profile-landing.md](epic-02-profile-landing.md) | [x] | [x] |
| 03 - Gestao de Alunos | [epic-03-students.md](epic-03-students.md) | [x] | [x] |
| 04 - Gestao de Treinos | [epic-04-workouts.md](epic-04-workouts.md) | [x] | [x] |
| 05 - Agenda e Agendamentos | [epic-05-scheduling.md](epic-05-scheduling.md) | [x] | [x] |
| 06 - Planos SaaS e Assinatura | [epic-06-saas-plans.md](epic-06-saas-plans.md) | [x] | [x] |
| 07 - Area do Admin | [epic-07-admin.md](epic-07-admin.md) | [x] | [x] |
| 08 - Estabilizacao da Base (Quality & UX) | [epic-08-stabilization.md](epic-08-stabilization.md) | — | `[x]` |
| 09 - Freemium e Conversao | [epic-09-freemium-conversion.md](epic-09-freemium-conversion.md) | [ ] | [ ] |
| 10 - Agenda e Produtividade do Personal | [epic-10-agenda-e-produtividade.md](epic-10-agenda-e-produtividade.md) | [ ] | [ ] |
| Epic 11 - Treinos, Midia e Tema | [epic-11-treinos-midia-e-tema.md](epic-11-treinos-midia-e-tema.md) | [ ] | [ ] |
| 12 - Páginas Institucionais e Legais | [epic-12-institutional.md](epic-12-institutional.md) | [ ] | [ ] |
| 13 - Redesign de Autenticação e Recuperação de Senha | [epic-13-auth-redesign.md](epic-13-auth-redesign.md) | [x] | [x] |
| 14 - Refinamento de UI/UX (Premium Experience) | [epic-14-ui-ux-refinement.md](epic-14-ui-ux-refinement.md) | — | [ ] |
| 15 - SEO e Autoridade Digital | [epic-15-seo.md](epic-15-seo.md) | — | [ ] |
| 16 - Checkout Transparente e Conversão SaaS | [epic-16-checkout-flow.md](epic-16-checkout-flow.md) | [ ] | [ ] |
| 17 - Excelência em Testes e Garantia de Qualidade | [epic-17-backend-testing.md](epic-17-backend-testing.md) | [ ] | — |
| Backlog Pos-MVP | [post-mvp-backlog.md](post-mvp-backlog.md) | — | — |

## Roadmap por Sprint

```
PRE-SPRINT — Schema Reset (fazer antes de tudo)
  Reescrever schema → deletar migrations → gerar nova migration limpa → atualizar seed

Sprint 1 — Fundacao Auth
  US-001 → US-002
  (US-006 removida — absorvida por US-002)

Sprint 2 — Personal Area Core
  US-003 → US-004 → US-005

Sprint 3 — Gestao de Treinos
  US-007 → US-008 → US-009 → US-010

Sprint 4 — Agenda e Booking
  US-011 → US-012 → US-013 → US-014

Sprint 5 — Monetizacao
  US-015 → US-016

Sprint 6 — Admin Area
  US-017 → US-018

Sprint 7 — Freemium e Conversao
  US-021 → US-022 → US-023

Sprint 8 — Agenda Operacional do Personal
  US-032 (disponibilidade em lote) → US-024 (sessao avulsa + recorrencia + exclusao por escopo) → US-025

Sprint 9 — Busca e Midia
  US-026 → US-027 → US-028

Sprint 10 — Organizacao de Treinos
  US-029 → US-030

Sprint 11 — Tema do Painel Personal e Marketing
  US-031 → US-033 → US-034

Sprint 12 — Suporte e Retenção
  US-035

Sprint 13 — Redesign e UX de Autenticação
  US-037 → US-038 → US-039

Sprint 14 — Refinamento Visual Premium
  US-040 → US-041 → US-042 → US-043

Sprint 15 — SEO e Indexação
  US-044 → US-045 → US-046

Sprint 16 — Funil de Conversão e Checkout Stripe
  US-047 → US-048 → US-049

Sprint 17 — Qualidade e Automação de Testes
  US-050 → US-051 → US-052
```

> **Nota Sprint 8:** US-032 adicionada antes de US-024 — corrige UX critica de disponibilidade (configurar slot por slot e inviavel na pratica).
> **Aluno multi-personal:** Adiado para pos-MVP. Ver [post-mvp-backlog.md](post-mvp-backlog.md).

## Mapa de Dependencias (revisado)

```
SCHEMA RESET (pre-requisito global)
  └── US-001 (Register Personal)
        └── US-002 (Login Unificado — Personal, Student, Admin)
              ├── US-003 (Perfil do Personal)
              │     └── US-004 (Landing Page Publica)
              ├── US-005 (Criar Aluno)  ← cria users+students em transacao
              │     ├── US-010 (Aluno ve Treinos)  ← usa JWT do login unificado
              │     └── US-013 (Aluno agenda sessao)
              ├── US-007 (Exercicios)
              │     └── US-008 (Workout Plans)
              │           └── US-009 (Atribuir Treino)
              │                 └── US-010
              ├── US-011 (Disponibilidade)
              │     ├── US-013
              │     └── US-032 (Disponibilidade em lote)  ← UX critica: configurar dia inteiro + copiar dias
              │           └── US-024
              ├── US-012 (Service Plans)
              │     └── US-013
              │           └── US-014 (Personal gerencia agenda)
              └── US-017 (Admin gerencia personals)
                    └── US-018 (Admin gerencia planos SaaS)

US-015 (Planos SaaS publicos) — independente do auth
  └── US-016 (Stripe) — depende de US-001
```

## Estado do Projeto (atualizado 2026-03-10)

### Backend — 100% implementado (todos os épicos 01–07)
- Infraestrutura: guards JWT/Roles, filters, interceptors, decorators, providers Drizzle, S3, Stripe, Resend
- Schema com 4 migrations aplicadas (users, personals, students, admins, exercises, workout_plans,
  workout_exercises, workout_plan_students, availability_slots, service_plans, bookings, plans, password_setup_tokens)
- 98 arquivos de teste, 278 testes — 100% passando
- Seed com dados iniciais (3 usuários, 3 planos SaaS, 50 exercícios globais)
- Swagger disponível em http://localhost:3000/api/docs

### Frontend — em andamento (atualizado 2026-03-07)

**Epic 01 — Autenticacao e Fundacao:** `[x]` completo
- `/cadastro` — registro de personal (React Hook Form + Zod, toggle senha, erros por campo)
- `/login` — login unificado com redirect por role
- `AuthProvider` — accessToken em memoria, signIn/signOut
- `middleware.ts` — protecao de rotas por role (PERSONAL/STUDENT/ADMIN)
- `api.ts` — axios com interceptor de refresh token automatico (401 → refresh → retry)
- `QueryProvider`, `AppProvider` configurados

**Epic 02 — Perfil e Landing Page:** `[~]` em andamento
- US-003 `[x]` — `/painel/perfil` implementado:
  - Layout com sidebar responsiva (desktop: sidebar fixa, mobile: drawer com hamburger)
  - Formulario completo: dados pessoais, cor do tema, upload de foto, campos da LP
  - Color picker nativo + input hex sincronizados
  - Upload de imagens via `POST /personals/me/profile/upload` com preview
  - React Query para fetch/mutacao + invalidacao de cache
  - Feedback de sucesso/erro inline
- US-004 `[x]` — Landing page publica `/{slug}` implementada (SSR, generateMetadata, 4 seções, 404 customizado)

**Epic 03:** `[x]` completo
**Epic 04 — Gestao de Treinos:** `[x]` completo
**Epic 05 — Agenda e Agendamentos:** `[x]` completo
**Epic 06 — Planos SaaS e Assinatura:** `[x]` completo
**Epic 07 — Area do Admin:** `[x]` completo
- Admin shell com sidebar responsiva (desktop fixa + mobile drawer)
- `/admin/dashboard` — KPIs (MRR, assinantes, churn), AreaChart e PieChart com Recharts, filtro de período
- `/admin/personals` — tabela paginada com busca, toggle de status inline
- `/admin/personals/:id` — detalhe com dados de perfil e assinatura (link Stripe)
- `/admin/plans` — CRUD de planos SaaS, reordenação com botões up/down, toggle ativo/inativo
- `/admin` → redirect para `/admin/dashboard`

**Estrutura base do painel:**
- `PainelShell` — layout responsivo com sidebar desktop + drawer mobile
- `PainelSidebar` — navegacao com active state e logout
- Rotas placeholder criadas: `/painel`, `/painel/assinatura`, `/admin`, `/{slug}/alunos/painel`

### Proximo passo
Continuar Epic 09 — Freemium e Conversao.
Ordem sugerida: US-022 → US-023.
