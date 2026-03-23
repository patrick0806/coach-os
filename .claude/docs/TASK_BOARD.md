# TASK_BOARD.md — Coach OS

Last updated: 2026-03-23

---

## Milestone 13 — System Audit Fixes ✅ COMPLETE (2026-03-22)

> 73 findings across 12 modules. 41 fixed, 1 accepted risk (CHK-031 TOCTOU).
> Waves 1-5 all done. See SYSTEM_STATUS.md for details.

---

## Milestone 15 — UX Fixes + Training Schedule UI ✅ COMPLETE (2026-03-23)

> 3 features/fixes implemented.

---

### Feature 1 — Midia do exercicio na execucao do treino (aluno) ✅

- [x] Backend: adicionar `youtubeUrl` ao join em `studentPrograms.repository.ts`
- [x] Backend: atualizar interface `StudentExerciseWithExercise` com `youtubeUrl`
- [x] Backend: atualizar testes de `getStudentProgram.useCase.spec.ts` e `assignProgram.useCase.spec.ts`
- [x] Frontend: adicionar `youtubeUrl` ao tipo `StudentExerciseItem`
- [x] Frontend: renderizar midia (imagem/GIF + link YouTube) em `activeExerciseView.tsx`
- [x] Frontend: criar testes comportamentais `workoutExecution.behavior.spec.ts`

---

### Feature 2 — Reorganizar Perfil para Configuracoes ✅

- [x] Frontend: extrair `formatPhone` para `shared/utils/formatPhone.ts`
- [x] Frontend: criar `profileSettingsSection.tsx` em `features/settings/components/`
- [x] Frontend: refatorar `settings/page.tsx` com secoes (Perfil + Seguranca)
- [x] Frontend: refatorar `profileTab.tsx` — remover foto, bio, telefone (manter especialidades + cores)
- [x] Frontend: refatorar `lpEditorPage.tsx` — renomear aba "Perfil" para "Aparencia"
- [x] Frontend: atualizar tour `landingPage.tour.ts` referencia "Perfil" → "Aparencia"
- [x] Frontend: atualizar `profileEditor.behavior.spec.ts` para novas abas
- [x] Frontend: criar testes comportamentais `settings.behavior.spec.ts`

---

### Feature 3 — UI para horarios de treino do aluno ✅

- [x] Frontend: adicionar tipos `TrainingScheduleItem`, `CreateTrainingScheduleRequest`, `UpdateTrainingScheduleRequest` em `scheduling.types.ts`
- [x] Frontend: adicionar metodos CRUD ao `scheduling.service.ts`
- [x] Frontend: criar hooks `useTrainingSchedules.ts` (list, create, update, delete)
- [x] Frontend: criar `trainingScheduleFormDialog.tsx` (create/edit dialog)
- [x] Frontend: criar `studentScheduleSection.tsx` (conteudo da aba Agenda)
- [x] Frontend: habilitar aba "Agenda" em `studentDetail.tsx` + overflow-x-auto para mobile
- [x] Frontend: criar fixtures `trainingSchedules.fixtures.ts`
- [x] Frontend: criar testes comportamentais `trainingSchedules.behavior.spec.ts`

---

### Bug fix — Onboarding checklist visivel com 8/8 ✅

- [x] Frontend: `onboardingChecklist.tsx` — esconder quando `completedPages.length >= TOUR_PAGES.length`
- [x] Frontend: `useTourProgress.ts` — sincronizar auth store quando todas as paginas estao completas

---

## Backlog — Notifications (Milestone 14)

- [ ] Implementar notificacoes por email (Resend): lembretes de treino, sessao, treino nao realizado
- [ ] Implementar pagina de preferencias de notificacao

---

## Descartado

- **Tina CMS para editor de pagina** — nao adequado; dados estao no PostgreSQL, cria segunda fonte de verdade
- **Custom domains (Sprint 5)** — complexidade muito alta; avaliar apos validacao com coaches Elite
- **Sentry Error SDK** — descartado; Better Stack ja cobre logs, uptime e telemetria
