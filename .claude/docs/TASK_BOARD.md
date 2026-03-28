# TASK_BOARD.md — Coach OS

Last updated: 2026-03-27

---

## Student Program Full Editing ✅ COMPLETE (2026-03-27)

Alunos agora podem ter seus programas totalmente editados pelo personal: adicionar/remover/reordenar dias de treino e exercícios. 907 testes backend + build frontend passando.

- [x] Backend: `workoutDays.repository` + `studentExercises.repository` com métodos delete/reorder/findMaxOrder
- [x] Backend: use cases addWorkoutDay, reorderWorkoutDays (studentPrograms module)
- [x] Backend: use cases deleteWorkoutDay, addStudentExercise, reorderStudentExercises (workoutDays module)
- [x] Backend: use case deleteStudentExercise (studentExercises module)
- [x] Backend: 29 novos testes unitários
- [x] Frontend: service methods + types + 6 hooks
- [x] Frontend: AddWorkoutDayDialog + AddStudentExerciseDialog
- [x] Frontend: WorkoutDayCard e StudentExerciseItem com controles ▲▼ e deletar
- [x] Frontend: página de detalhe do programa com botão "Adicionar dia"

---

## Code Quality Refactoring ✅ COMPLETE (2026-03-26)

Refatoracao de qualidade de codigo sem mudancas de comportamento. 878 testes backend + build frontend passando.

- [x] Fase 1: Consolidar formatMoney — 12 arquivos usando utilitario compartilhado `@/lib/formatMoney`
- [x] Fase 2: Criar utilitario `formatDate` — novo `shared/utils/formatDate.ts` + 11 arquivos atualizados
- [x] Fase 3: Extrair logica de limite de alunos — novo `shared/utils/studentLimit.util.ts`, 3 use cases simplificados
- [x] Fase 4: Batch inserts — `createMany` no ExerciseTemplatesRepository, usado no duplicateProgramTemplate
- [x] Fase 5: Otimizar reorder — `Promise.all` em exerciseTemplates e workoutTemplates repositories
- [x] Seed atualizado — removidas entidades antigas do scheduling (availabilityRules, trainingSchedules, etc.)

---

## Scheduling Refactoring ✅ COMPLETE (2026-03-25)

Consolidated 6 scheduling tables into 3 (working_hours, recurring_slots, calendar_events).

- [x] Phase 1: New schema + repositories + migration script
- [x] Phase 2: Backend use cases + API (working hours, recurring slots, calendar events, calendar pipeline, availability)
- [x] Phase 3: Frontend migration (services, hooks, components, types, student portal, public page)
- [x] Pre-Phase 4 fixes: axios v1/v2 separation, bulk working hours endpoint, next.config rewrite fix
- [x] Phase 4: Remove old e2e tests
- [x] Phase 5: Cleanup — remove old module/repos/schema, rename schedulingV2 → scheduling, update cross-module deps
- [x] Documentation: SYSTEM_MAP, DOMAIN_MAP, TASK_BOARD, SYSTEM_STATUS updated
- [ ] Pending: Drop old DB tables via migration (availability_rules, availability_exceptions, appointment_requests, appointments, training_schedules, training_schedule_exceptions)

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

## Admin Invite Coach ✅ COMPLETE (2026-03-25)

- [x] Schema `coachInvitationTokens` + migration
- [x] Repository `CoachInvitationTokensRepository`
- [x] Backend: `POST /v1/admin/coaches/invite` (admin only)
- [x] Backend: `POST /v1/auth/accept-coach-invite` (public)
- [x] Email template `coachInvite.email.tsx` + ResendProvider
- [x] `getSubscription` response includes `isWhitelisted`
- [x] Frontend: `InviteCoachDialog` + hook + service
- [x] Frontend: `/aceitar-convite-coach` page
- [x] Frontend: `/assinatura` hides billing for whitelisted coaches
- [x] 15 unit tests (903 total passing)

---

## Backlog — Notifications (Milestone 14)

- [ ] Implementar notificacoes por email (Resend): lembretes de treino, sessao, treino nao realizado
- [ ] Implementar pagina de preferencias de notificacao

---

## Descartado

- **Tina CMS para editor de pagina** — nao adequado; dados estao no PostgreSQL, cria segunda fonte de verdade
- **Custom domains (Sprint 5)** — complexidade muito alta; avaliar apos validacao com coaches Elite
- **Sentry Error SDK** — descartado; Better Stack ja cobre logs, uptime e telemetria
