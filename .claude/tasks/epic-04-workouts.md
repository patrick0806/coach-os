# Epic 04 — Gestao de Treinos

Status: `[x]` done

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
- [x] Os exercicios sao gerenciados dentro do builder de treino (US-008)
- [x] Componente de busca/selecao de exercicios reutilizavel
- [x] Badge colorido por grupo muscular (MUSCLE_GROUP_COLORS em exercises.service.ts)
- [x] Formulario de criacao de exercicio customizado (dentro do AddExerciseDialog)

### Notas Tecnicas
- O seed ja popula ~50 exercicios globais em varios grupos musculares
- Ao listar, retornar indicador de `isGlobal: true/false` para o frontend diferenciar
- Excluir exercicio proprio que esta em uso em algum workout_plan deve retornar erro 409
- **Tenant isolation:** `ExercisesRepository.findAll(tenantId)` retorna globais (personalId IS NULL) + proprios (personalId = tenantId)
- `ExercisesRepository.delete(id, tenantId)` valida `WHERE id = $id AND personalId = $tenantId`

---

## US-008 — Personal cria plano de treino

**Status:** `[x]` done
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
- [x] `POST /workout-plans` — criar plano
- [x] `GET /workout-plans?page=&size=` — listar planos do personal (paginado)
- [x] `GET /workout-plans/:id` — buscar plano com exercicios ordenados
- [x] `PATCH /workout-plans/:id` — atualizar nome/descricao
- [x] `DELETE /workout-plans/:id` — excluir plano (e exercicios vinculados)
- [x] `POST /workout-plans/:id/exercises` — adicionar exercicio ao plano
- [x] `DELETE /workout-plans/:id/exercises/:workoutExerciseId` — remover exercicio
- [x] `PATCH /workout-plans/:id/exercises/reorder` — reordenar (body: array de {id, order})
- [x] `WorkoutPlansRepository` com CRUD
- [x] `WorkoutExercisesRepository` com CRUD
- [x] Unit tests para cada context

### Subtasks Frontend
- [x] Rota: `/painel/treinos`
- [x] Lista de planos criados com cards
- [x] Rota de criacao/edicao: `/painel/treinos` (dialog) e `/painel/treinos/:id`
- [x] Builder com:
  - [x] Campo nome e descricao
  - [x] Busca e adicao de exercicios da biblioteca
  - [x] Lista de exercicios com reordenacao (botoes up/down)
  - [x] Campos inline por exercicio: series, reps, carga, notas
  - [x] Botao de remover exercicio

### Notas Tecnicas
- Drag & drop: usar biblioteca leve (ex: `@dnd-kit/core`) sem overhead excessivo
- Ao excluir plano que tem alunos atribuidos, decidir comportamento (desatribuir automaticamente ou bloquear)
- **Tenant isolation:** todos os metodos de `WorkoutPlansRepository` recebem `tenantId` e filtram por `workout_plans.personalId = tenantId`
- Incluir caso de teste: tentar acessar workout_plan de outro tenant → 404

---

## US-009 — Personal atribui treino a um aluno

**Status:** `[x]` done
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
- [x] `POST /workout-plans/:id/students` — atribuir plano a aluno(s) (body: `{ studentIds: string[] }`)
- [x] `DELETE /workout-plans/:id/students/:studentId` — revogar atribuicao
- [x] `GET /students/:id/workout-plans` — planos de um aluno especifico
- [x] `WorkoutPlanStudentsRepository` com: `assign`, `revoke`, `findByStudent`
- [x] Validar que o aluno pertence ao personal autenticado
- [x] Unit tests para cada context

### Subtasks Frontend
- [x] Na pagina de detalhe do aluno: secao "Treinos Atribuidos"
- [x] Modal para selecionar e atribuir planos existentes do personal
- [x] Botao de remover atribuicao
- [x] Indicador visual de quais planos estao atribuidos ao aluno

### Notas Tecnicas
- **Tenant isolation:** `WorkoutPlanStudentsRepository.assign(planId, studentId, tenantId)` valida que tanto o plano quanto o aluno pertencem ao mesmo tenant antes de inserir
- A validacao de tenant e feita no service, nao no controller
- Nunca confiar no `personalId` enviado pelo cliente — usar sempre `currentUser.personalId`

---

## US-010 — Aluno visualiza seus treinos

**Status:** `[x]` done
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
- [x] `GET /students/me/workout-plans` — treinos do aluno autenticado
- [x] `GET /students/me/workout-plans/:planId` — detalhe do treino com exercicios
- [x] Guard: role `STUDENT`
- [x] Unit tests

### Subtasks Frontend
- [x] Rota: `/{slug}/alunos/treinos`
- [x] Cards de treino (lista com link para detalhe)
- [x] Rota de detalhe: `/{slug}/alunos/treinos/:planId`
- [x] Lista de exercicios com: nome, grupo muscular, series x reps, carga, notas
- [x] Dark mode (via layout (alunos))

### Notas Tecnicas
- O endpoint usa `currentUser.profileId` (studentId) e `currentUser.personalId` (tenantId) extraidos do JWT
- `GET /students/me/workout-plans`: busca em `workout_plan_students WHERE studentId = profileId` + join com `workout_plans WHERE personalId = tenantId`
- Retornar dados do exercicio junto (join com tabela exercises e workout_exercises)
