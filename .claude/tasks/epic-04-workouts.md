# Epic 04 — Gestao de Treinos

Status: `[ ]` todo

> **Revisao aplicada:** ver [architectural-review.md](architectural-review.md)
> Todos os repositories com escopo de tenant DEVEM receber `tenantId` como parametro.
> `tenantId = currentUser.personalId` — extraido do JWT, nunca de params ou body.
> Queries DEVEM incluir `WHERE personalId = tenantId` em todas as operacoes.

---

## US-007 — Personal gerencia exercicios

**Status:** `[x]` done
**Sprint:** 3
**Dependencias:** US-002

**Descricao:**
Como personal trainer, quero visualizar a biblioteca de exercicios e criar exercicios personalizados para montar treinos para meus alunos.

### Criterios de Aceite
- [x] Listar exercicios globais (`personalId IS NULL`) + exercicios proprios (`personalId = me`)
- [x] Criar exercicio customizado: nome, descricao, grupo muscular
- [x] Filtrar por grupo muscular
- [x] Busca por nome
- [x] Excluir exercicios proprios (nao pode excluir os globais)
- [x] Grupos musculares disponiveis: peito, costas, ombro, biceps, triceps, perna, gluteo, core

### Diretivas de Implementacao
- Modulo: `src/modules/workouts/`
- Contexts dentro de workouts: `exercises/list-exercises/`, `exercises/create-exercise/`, `exercises/delete-exercise/`
- `ExercisesRepository`

### Subtasks Backend
- [x] `GET /exercises?muscleGroup=&search=` — listar com filtros (globais + proprios)
- [x] `POST /exercises` — criar exercicio proprio
- [x] `DELETE /exercises/:id` — excluir exercicio proprio (valida ownership)
- [x] `ExercisesRepository` com: `findAll`, `create`, `delete`
- [x] `list-exercises.controller.spec.ts` + `list-exercises.service.spec.ts`
- [x] `create-exercise.controller.spec.ts` + `create-exercise.service.spec.ts`
- [x] `delete-exercise.controller.spec.ts` + `delete-exercise.service.spec.ts`

### Subtasks Frontend
- [ ] Os exercicios sao gerenciados dentro do builder de treino (US-008)
- [ ] Componente de busca/selecao de exercicios reutilizavel
- [ ] Badge colorido por grupo muscular
- [ ] Formulario de criacao de exercicio customizado

### Notas Tecnicas
- O seed ja popula ~50 exercicios globais em varios grupos musculares
- Ao listar, retornar indicador de `isGlobal: true/false` para o frontend diferenciar
- Excluir exercicio proprio que esta em uso em algum workout_plan deve retornar erro 409
- **Tenant isolation:** `ExercisesRepository.findAll(tenantId)` retorna globais (personalId IS NULL) + proprios (personalId = tenantId)
- `ExercisesRepository.delete(id, tenantId)` valida `WHERE id = $id AND personalId = $tenantId`

---

## US-008 — Personal cria plano de treino

**Status:** `[ ]` todo
**Sprint:** 3
**Dependencias:** US-007

**Descricao:**
Como personal trainer, quero criar planos de treino para prescrevia-los aos meus alunos.

### Criterios de Aceite
- [ ] Campos do plano: nome, descricao
- [ ] Adicionar exercicios ao plano: exercicio, series, repeticoes, carga, ordem, notas
- [ ] Reordenar exercicios dentro do plano
- [ ] Listar planos criados pelo personal (paginado)
- [ ] Editar e excluir plano
- [ ] Detalhe do plano retorna lista de exercicios ordenada

### Diretivas de Implementacao
- Contexts: `workout-plans/create/`, `workout-plans/list/`, `workout-plans/get/`, `workout-plans/update/`, `workout-plans/delete/`
- Sub-contexts para exercicios: `workout-plans/add-exercise/`, `workout-plans/remove-exercise/`, `workout-plans/reorder-exercises/`
- `WorkoutPlansRepository`, `WorkoutExercisesRepository`

### Subtasks Backend
- [ ] `POST /workout-plans` — criar plano
- [ ] `GET /workout-plans?page=&size=` — listar planos do personal (paginado)
- [ ] `GET /workout-plans/:id` — buscar plano com exercicios ordenados
- [ ] `PATCH /workout-plans/:id` — atualizar nome/descricao
- [ ] `DELETE /workout-plans/:id` — excluir plano (e exercicios vinculados)
- [ ] `POST /workout-plans/:id/exercises` — adicionar exercicio ao plano
- [ ] `DELETE /workout-plans/:id/exercises/:workoutExerciseId` — remover exercicio
- [ ] `PATCH /workout-plans/:id/exercises/reorder` — reordenar (body: array de {id, order})
- [ ] `WorkoutPlansRepository` com CRUD
- [ ] `WorkoutExercisesRepository` com CRUD
- [ ] Unit tests para cada context

### Subtasks Frontend
- [ ] Rota: `/dashboard/workouts`
- [ ] Lista de planos criados com cards
- [ ] Rota de criacao/edicao: `/dashboard/workouts/new` e `/dashboard/workouts/:id`
- [ ] Builder com:
  - [ ] Campo nome e descricao
  - [ ] Busca e adicao de exercicios da biblioteca
  - [ ] Lista de exercicios com drag & drop para reordenar
  - [ ] Campos inline por exercicio: series, reps, carga, notas
  - [ ] Botao de remover exercicio

### Notas Tecnicas
- Drag & drop: usar biblioteca leve (ex: `@dnd-kit/core`) sem overhead excessivo
- Ao excluir plano que tem alunos atribuidos, decidir comportamento (desatribuir automaticamente ou bloquear)
- **Tenant isolation:** todos os metodos de `WorkoutPlansRepository` recebem `tenantId` e filtram por `workout_plans.personalId = tenantId`
- Incluir caso de teste: tentar acessar workout_plan de outro tenant → 404

---

## US-009 — Personal atribui treino a um aluno

**Status:** `[ ]` todo
**Sprint:** 3
**Dependencias:** US-005, US-008

**Descricao:**
Como personal trainer, quero atribuir um plano de treino a um aluno para que ele possa acessar e seguir o treino.

### Criterios de Aceite
- [ ] Associar `workoutPlan` a um ou mais `students`
- [ ] Impedir duplicidade (unique constraint: `uniq_workout_plan_student`)
- [ ] Aluno pode ter multiplos planos (Treino A, B, C)
- [ ] Listar alunos com seus planos atribuidos
- [ ] Revogar atribuicao de treino

### Subtasks Backend
- [ ] `POST /workout-plans/:id/students` — atribuir plano a aluno(s) (body: `{ studentIds: string[] }`)
- [ ] `DELETE /workout-plans/:id/students/:studentId` — revogar atribuicao
- [ ] `GET /students/:id/workout-plans` — planos de um aluno especifico
- [ ] `WorkoutPlanStudentsRepository` com: `assign`, `revoke`, `findByStudent`
- [ ] Validar que o aluno pertence ao personal autenticado
- [ ] Unit tests para cada context

### Subtasks Frontend
- [ ] Na pagina de detalhe do aluno: secao "Treinos Atribuidos"
- [ ] Modal para selecionar e atribuir planos existentes do personal
- [ ] Botao de remover atribuicao
- [ ] Indicador visual de quais planos estao atribuidos ao aluno

### Notas Tecnicas
- **Tenant isolation:** `WorkoutPlanStudentsRepository.assign(planId, studentId, tenantId)` valida que tanto o plano quanto o aluno pertencem ao mesmo tenant antes de inserir
- A validacao de tenant e feita no service, nao no controller
- Nunca confiar no `personalId` enviado pelo cliente — usar sempre `currentUser.personalId`

---

## US-010 — Aluno visualiza seus treinos

**Status:** `[ ]` todo
**Sprint:** 3
**Dependencias:** US-006, US-009

**Descricao:**
Como aluno, quero visualizar os treinos prescritos pelo meu personal para saber o que devo fazer em cada sessao.

### Criterios de Aceite
- [ ] Listar planos de treino atribuidos ao aluno autenticado
- [ ] Detalhe do treino: lista de exercicios ordenada com series, reps, carga, notas
- [ ] Interface dark mode
- [ ] Rota acessivel apenas pelo proprio aluno (role STUDENT)

### Subtasks Backend
- [ ] `GET /students/me/workout-plans` — treinos do aluno autenticado
- [ ] `GET /students/me/workout-plans/:id` — detalhe do treino com exercicios
- [ ] Guard: role `STUDENT`
- [ ] Unit tests

### Subtasks Frontend
- [ ] Rota: `/{personal-slug}/students/workouts`
- [ ] Cards de treino (Treino A, B, C...)
- [ ] Rota de detalhe: `/{personal-slug}/students/workouts/:id`
- [ ] Lista de exercicios com: nome, grupo muscular, series x reps, carga, notas
- [ ] Dark mode (diretiva do CLAUDE.md para area de students)

### Notas Tecnicas
- O endpoint usa `currentUser.profileId` (studentId) e `currentUser.personalId` (tenantId) extraidos do JWT
- `GET /students/me/workout-plans`: busca em `workout_plan_students WHERE studentId = profileId` + join com `workout_plans WHERE personalId = tenantId`
- Retornar dados do exercicio junto (join com tabela exercises e workout_exercises)
