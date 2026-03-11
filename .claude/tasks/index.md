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
| 11 - Treinos, Midia e Tema | [epic-11-treinos-midia-e-tema.md](epic-11-treinos-midia-e-tema.md) | [x] | [x] |
| 12 - Páginas Institucionais e Legais | [epic-12-institutional.md](epic-12-institutional.md) | [ ] | [ ] |
| 13 - Redesign de Autenticação e Recuperação de Senha | [epic-13-auth-redesign.md](epic-13-auth-redesign.md) | [x] | [x] |
| 14 - Refinamento de UI/UX (Premium Experience) | [epic-14-ui-ux-refinement.md](epic-14-ui-ux-refinement.md) | — | [ ] |
| 15 - SEO e Autoridade Digital | [epic-15-seo.md](epic-15-seo.md) | — | [ ] |
| 16 - Excelência em Testes e Garantia de Qualidade | [epic-16-testing.md](epic-16-testing.md) | [ ] | [ ] |
| 17 - Checkout Transparente e Conversão SaaS | [epic-17-checkout-flow.md](epic-17-checkout-flow.md) | [ ] | [ ] |
| 18 - Treinos Customizados e Independentes | [epic-18-custom-workouts.md](epic-18-custom-workouts.md) | [ ] | [ ] |
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

Sprint 16 — Excelência em Testes e Automação
  US-050 → US-051 → US-052 → US-053

Sprint 17 — Funil de Conversão e Checkout Stripe
  US-047 → US-048 → US-049

Sprint 18 — Treinos Customizados e Independentes
  US-054
```

> **Nota Sprint 8:** US-032 adicionada antes de US-024 — corrige UX critica de disponibilidade (configurar slot por slot e inviavel na pratica).
> **Aluno multi-personal:** Adiado para pos-MVP. Ver [post-mvp-backlog.md](post-mvp-backlog.md).

...
