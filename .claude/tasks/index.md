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
| 03 - Gestao de Alunos | [epic-03-students.md](epic-03-students.md) | [x] | [ ] |
| 04 - Gestao de Treinos | [epic-04-workouts.md](epic-04-workouts.md) | [x] | [ ] |
| 05 - Agenda e Agendamentos | [epic-05-scheduling.md](epic-05-scheduling.md) | [x] | [ ] |
| 06 - Planos SaaS e Assinatura | [epic-06-saas-plans.md](epic-06-saas-plans.md) | [x] | [ ] |
| 07 - Area do Admin | [epic-07-admin.md](epic-07-admin.md) | [x] | [ ] |

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
```

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
              │     └── US-013
              ├── US-012 (Service Plans)
              │     └── US-013
              │           └── US-014 (Personal gerencia agenda)
              └── US-017 (Admin gerencia personals)
                    └── US-018 (Admin gerencia planos SaaS)

US-015 (Planos SaaS publicos) — independente do auth
  └── US-016 (Stripe) — depende de US-001
```

## Estado do Projeto (atualizado 2026-03-06)

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

**Epics 03–07:** `[ ]` pendentes

**Estrutura base do painel:**
- `PainelShell` — layout responsivo com sidebar desktop + drawer mobile
- `PainelSidebar` — navegacao com active state e logout
- Rotas placeholder criadas: `/painel`, `/painel/assinatura`, `/admin`, `/{slug}/alunos/painel`

### Proximo passo
US-005 — Gestao de Alunos: tabela paginada, criacao de aluno, convite por e-mail, detalhe e desativacao
