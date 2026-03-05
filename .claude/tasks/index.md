# Coach OS — Task Board

> **Revisao Arquitetural concluida** — ver [architectural-review.md](architectural-review.md) antes de iniciar qualquer implementacao.
> Decisoes criticas: schema reiniciado, auth unificado, tenant isolation via JWT + repository layer.

## Status Legend
- `[ ]` todo
- `[~]` in progress
- `[x]` done
- `[!]` blocked

## Epics

| Epic | Arquivo | Status |
|------|---------|--------|
| Revisao Arquitetural | [architectural-review.md](architectural-review.md) | [x] |
| 01 - Autenticacao e Fundacao | [epic-01-auth.md](epic-01-auth.md) | [ ] |
| 02 - Perfil e Landing Page | [epic-02-profile-landing.md](epic-02-profile-landing.md) | [ ] |
| 03 - Gestao de Alunos | [epic-03-students.md](epic-03-students.md) | [ ] |
| 04 - Gestao de Treinos | [epic-04-workouts.md](epic-04-workouts.md) | [ ] |
| 05 - Agenda e Agendamentos | [epic-05-scheduling.md](epic-05-scheduling.md) | [ ] |
| 06 - Planos SaaS e Assinatura | [epic-06-saas-plans.md](epic-06-saas-plans.md) | [ ] |
| 07 - Area do Admin | [epic-07-admin.md](epic-07-admin.md) | [ ] |

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

## Estado do Projeto na Data de Criacao (2026-03-05)

### Backend — implementado
- Infraestrutura base: guards JWT/Roles, filters, interceptors, decorators, providers Drizzle
- Schema completo com migrations (users, personals, students, exercises, workout_plans, workout_exercises, availability_slots, service_plans, bookings, plans)
- Modulo `health` (unico endpoint real)
- Seed com dados iniciais

### Frontend — implementado
- Next.js configurado com shadcn/ui base
- Componentes: button, card, input, select, textarea, alert-dialog, badge, combobox, dropdown-menu, field, input-group, label, separator
- Layout raiz e pagina inicial vazia

### Nenhum modulo de negocio implementado ainda
