# TASK_BOARD.md — Coach OS

Last updated: 2026-03-23

---

## Milestone 16 — Mobile UX Fixes ✅ COMPLETE (2026-03-23)

- [x] Sidebar fecha automaticamente ao navegar no mobile
- [x] Lista de alunos: substituído por cards verticais no mobile (tabela mantida no desktop)
- [x] Abas do aluno: scroll isolado na TabsList, sem overflow na página
- [x] Agenda do aluno: campos Início/Fim empilhados no mobile (grid-cols-1)
- [x] Cards de exercício: botão de ações sempre visível em dispositivos touch
- [x] Modal de exercício: padding/containment do GIF corrigido
- [x] Modal de seleção de exercícios: overflow corrigido no mobile e na web (badge e footer cortados)
- [x] Testes comportamentais atualizados: cards mobile em students, botão de ações em exercises

---

## Backlog — Notifications (Milestone 14)

- [ ] Implementar notificacoes por email (Resend): lembretes de treino, sessao, treino nao realizado
- [ ] Implementar pagina de preferencias de notificacao

---

## Descartado

- **Tina CMS para editor de pagina** — nao adequado; dados estao no PostgreSQL, cria segunda fonte de verdade
- **Custom domains (Sprint 5)** — complexidade muito alta; avaliar apos validacao com coaches Elite
- **Sentry Error SDK** — descartado; Better Stack ja cobre logs, uptime e telemetria
