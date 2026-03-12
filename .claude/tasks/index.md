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
| 19 - Atendimento e Execução Gamificada | [epic-19-attendance-and-execution.md](epic-19-attendance-and-execution.md) | [ ] | [ ] |
| 20 - Agenda Inteligente e Performance | [epic-20-weekly-periodization.md](epic-20-weekly-periodization.md) | [ ] | [ ] |
| 21 - Qualidade, Segurança e Resiliência | [epic-21-quality-security-and-resilience.md](epic-21-quality-security-and-resilience.md) | [ ] | [ ] |
| Backlog Pos-MVP | [post-mvp-backlog.md](post-mvp-backlog.md) | — | — |

## Roadmap por Sprint

```
...
Sprint 19 — Atendimento e Execução Gamificada
  US-055 → US-056 → US-057

Sprint 20 — Agenda Inteligente e Performance
  US-058 → US-059 → US-060 → US-061 → US-062 → US-063 → US-064

Sprint 21 — Qualidade, Segurança e Resiliência (E2E)
  US-065 → US-066 → US-067 → US-068 → US-069
```
