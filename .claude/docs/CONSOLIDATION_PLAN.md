# CONSOLIDATION_PLAN.md — Coach OS

Last updated: 2026-03-18

---

## Objetivo

Consolidar a base de codigo antes de avançar com novas features.
Foco em: qualidade, segurança, performance, cobertura de testes e correcao de problemas conhecidos.

---

## Fase 1 — Enums e Consistencia de Dados

### 1.1 MuscleGroup → Enum (Backend + Frontend)

**Problema:** `muscleGroup` e uma `varchar(100)` livre no banco. O frontend define uma lista hardcoded em `MUSCLE_GROUPS` (`exercises.types.ts`). Se o coach digitar um valor diferente (via API ou seed), o frontend nao encontra no filtro.

**Solucao:**

**Backend:**
1. Criar enum `MuscleGroup` em `backend/src/shared/enums/muscleGroup.enum.ts`
2. Criar rota `GET /enums/muscle-groups` que retorna os valores do enum (controller em `shared/` ou `exercises/`)
3. Atualizar o schema Drizzle `exercises.ts` para usar `.$type<MuscleGroup>()`
4. Atualizar DTOs de request (Zod validation com `z.enum(...)`) e response
5. Criar migration para converter dados existentes (se necessario)
6. Atualizar seed para usar o enum
7. Atualizar testes

**Frontend:**
1. Remover `MUSCLE_GROUPS` hardcoded de `exercises.types.ts`
2. Criar hook `useEnumMuscleGroups()` que faz GET `/enums/muscle-groups` (com cache longo via React Query)
3. Atualizar todos os componentes que usam `MUSCLE_GROUPS`:
   - `exerciseCard.tsx`
   - `exerciseFormDialog.tsx`
   - `exerciseDetailDialog.tsx`
   - `exerciseFilters.tsx`
4. Atualizar tipos para usar o enum ao inves de `string`

**Arquivos afetados (backend):** ~27 arquivos referenciam `muscleGroup`
**Arquivos afetados (frontend):** ~8 arquivos referenciam `MUSCLE_GROUPS` ou `muscleGroup`

---

### 1.2 AttendanceType → Enum (Backend + Frontend)

**Problema:** `attendanceType` e um `varchar(20)` com `.$type<"online" | "presential">()` no schema, mas nao existe um enum centralizado. O frontend define `ATTENDANCE_TYPES` hardcoded em `servicePlans.types.ts`.

**Solucao:**

**Backend:**
1. Criar enum `AttendanceType` em `backend/src/shared/enums/attendanceType.enum.ts`
2. Adicionar a rota de enums: `GET /enums/attendance-types`
3. Atualizar schema `coaching.ts` (servicePlans) para usar o enum
4. Atualizar DTOs e validacoes Zod
5. Atualizar testes

**Frontend:**
1. Remover `ATTENDANCE_TYPES` hardcoded de `servicePlans.types.ts`
2. Criar hook `useEnumAttendanceTypes()`
3. Atualizar componentes:
   - `servicePlanFormDialog.tsx`
   - `servicePlanCard.tsx`
   - `publicServicePlans.tsx`
   - `studentContractSection.tsx`

**Arquivos afetados (backend):** ~21 arquivos
**Arquivos afetados (frontend):** ~6 arquivos

---

### 1.3 Rota Centralizada de Enums

**Decisao:** Criar um modulo `enums/` no backend com um unico controller:

```
GET /enums/muscle-groups    → MuscleGroup[]
GET /enums/attendance-types → AttendanceType[]
```

Rota publica (nao precisa de auth), resposta com cache header longo.

---

## Fase 2 — Bulk Save de Disponibilidade

### 2.1 Problema

No `availabilityWizard.tsx` (linhas 197-203), cada slot gera uma chamada HTTP individual:

```typescript
const calls = availableSlots.map((slot) =>
  schedulingService.createAvailabilityRule({...})
)
const results = await Promise.allSettled(calls)
```

Se o coach configura 5 dias x 10 slots = 50 chamadas simultaneas ao servidor.

### 2.2 Solucao

**Backend:**
1. Criar rota `POST /availability-rules/bulk` no modulo `scheduling/availability`
2. Criar DTO `BulkCreateAvailabilityRulesRequestDTO` com array de rules
3. Criar `BulkCreateRulesUseCase` que:
   - Valida todas as regras
   - Verifica conflitos com regras existentes para cada uma
   - Insere tudo em uma unica transacao (rollback se qualquer falhar)
   - Retorna array de regras criadas + array de conflitos ignorados
4. Criar testes unitarios

**Frontend:**
1. Adicionar metodo `bulkCreateAvailabilityRules(rules[])` no `scheduling.service.ts`
2. Atualizar `availabilityWizard.tsx` para usar a nova rota (uma unica chamada)
3. Tratar resposta (criados vs conflitos)

**Beneficios:**
- Atomicidade: tudo ou nada no banco
- Performance: 1 request ao inves de N
- Menor carga no servidor

---

## Fase 3 — Cobertura de Testes Frontend (Playwright)

### Status Atual dos Testes E2E

| Feature | Behavior | Smoke | Status |
|---------|----------|-------|--------|
| auth | ✅ | ✅ | OK |
| exercises | ✅ | ✅ | OK |
| home | ✅ | ✅ | OK |
| students | ✅ | ✅ | OK |
| services (servicePlans) | ✅ | ✅ | OK |
| coachingContracts | ✅ | ✅ | OK |
| studentPrograms | ✅ | ✅ | OK |
| trainingTemplates | ✅ | ✅ | OK |
| dashboard | ✅ | ❌ | Falta smoke |
| studentAuth | ✅ | ❌ | Falta smoke |
| workoutExecution | ✅ | ❌ | Falta smoke |
| scheduling | ✅ | ❌ | Falta smoke |
| progressCheckins | ✅ | ❌ | Falta smoke |
| **profileEditor** | ❌ | ❌ | **Sem testes** |
| **publicPage** | ❌ | ❌ | **Sem testes** |
| **studentPortal** | ❌ | ❌ | **Sem testes** |
| **marketing** | ❌ | ❌ | **Sem testes** (LP institucional) |

### 3.1 Prioridade Alta — Criar testes behavior (mock API, sem backend)

1. **profileEditor** — editor da pagina publica (salvar perfil, preview)
2. **publicPage** — renderizacao da LP do coach
3. **studentPortal** — portal do aluno (treinos, progresso, agenda)
4. **scheduling** — garantir wizard de disponibilidade, criacao/edicao/exclusao de regras e exceptions

### 3.2 Prioridade Media — Criar testes smoke (backend real)

1. **scheduling** — fluxo real de criar disponibilidade
2. **progressCheckins** — criar checkin real com metricas
3. **studentPortal** — login do aluno + visualizar treino

### 3.3 Status Atual dos Testes Backend

- **628 testes passando** (114 arquivos de teste)
- **Cobertura:** 94.63% lines | 91.68% branches | 96.47% functions
- Areas com cobertura mais baixa:
  - `all-exceptions.filter.ts` — 75% branch
  - `conflictDetection.util.ts` — 77% lines, 33% branch
  - `drizzle.service.ts` — 50% lines (provider boilerplate)

### 3.4 Corrigir Testes Existentes

- Rodar `npm run test:e2e` no frontend e corrigir qualquer teste falhando
- Backend OK: 628 testes passando

---

## Fase 4 — Code Review e Limpeza

### 4.1 Console.log em Producao

**Encontrados:** Apenas em `seed.ts` e `migrate.ts` (scripts CLI) — aceitavel.
**Frontend:** Nenhum `console.log` no codigo de producao — OK.

### 4.2 Dead Code

Auditoria automatizada revelou: **minimo dead code no backend** (zero arquivos orfaos).
Frontend tambem limpo — sem componentes ou services nao utilizados.

- [ ] Verificar imports nao utilizados com lint (minor)
- [ ] Verificar se ha tipos exportados mas nunca importados

### 4.3 Seguranca (Auditoria Concluida)

Resultado: **Score 8.5/10** — sem vulnerabilidades criticas.

- ✅ SQL injection: todas queries via Drizzle ORM (parametrizadas)
- ✅ Tenant isolation: enforced em todos os repositories
- ✅ Auth: Argon2id + JWT + refresh token rotation + timing-safe comparison
- ✅ Tokens: HTTP-only cookies (nao localStorage)
- ✅ Input validation: Zod em todos os DTOs
- ✅ CORS + Helmet configurados
- ✅ Nenhum campo sensivel exposto nas responses
- [ ] Rate limiting (futuro, nao critico agora)

### 4.4 Tipagem

- `as any` usado em 27 instancias nos repositories — todos por limitacao do Drizzle ORM com colunas nullable em operacoes SET. Aceitavel com comentarios explicativos.
- Frontend: nenhum uso de `any` detectado.

### 4.5 N+1 Query Patterns (Performance)

Encontrados 2 arquivos com loop de UPDATEs individuais (reorder methods):
- `exerciseTemplates.repository.ts:117-126`
- `workoutTemplates.repository.ts:91-100`

**Pergunta:** Otimizar esses reorder para batch UPDATE com CASE WHEN? Impacto baixo em uso normal (listas pequenas), mas e uma melhoria de qualidade.

### 4.6 Hardcoded Strings no Frontend (Alem dos Enums)

Encontrados labels hardcoded que deveriam ser centralizados:
- **Appointment status labels**: hardcoded em `appointmentDetailDialog.tsx` e `appointmentListItem.tsx`
- **Template status labels**: hardcoded em `templateFilters.tsx` e `templateCard.tsx`
- **Contract status labels**: hardcoded em `studentContractSection.tsx`
- **Appointment type**: hardcoded em `createAppointmentDialog.tsx` ao inves de importar `ATTENDANCE_TYPES`

**Pergunta:** Centralizar todos esses labels em arquivos de constantes por feature, ou criar um modulo `shared/enums/` no frontend?

---

## Ordem de Execucao Recomendada

| # | Tarefa | Estimativa | Dependencia | Status |
|---|--------|-----------|-------------|--------|
| 1 | Rodar testes (back + front) e corrigir falhas | - | Nenhuma | ✅ DONE (2026-03-18) |
| 2 | Criar modulo de enums no backend | - | Nenhuma | ✅ DONE (2026-03-18) |
| 3 | MuscleGroup → Enum (back + front + seed) | - | #2 | ✅ DONE (2026-03-18) |
| 4 | AttendanceType → Enum (back + front) | - | #2 | ✅ DONE (2026-03-18) |
| 5 | Ajustar tela de definição de senha e recuperação de senha(aluno) para o dominio do personal /personals/{slug}/definir-senha e /personals/{slug}/esqueci-senha, para que o aluno tenha uma experiencia unica com o sistema, a recuperação de senha atual serve para o admin e o personal, o redirect para o login deve ser para o dominio do personal(tudo isso é apenas para o aluno para o personal e admin continua igual) | - | Nenhuma | ✅ DONE (2026-03-18) |
| 6 | Bulk save de disponibilidade (back + front) | - | Nenhuma | ✅ DONE (2026-03-18) |
| 7 | Testes behavior: profileEditor | - | Nenhuma | ✅ DONE (2026-03-18) |
| 8 | Testes behavior: publicPage | - | Nenhuma | ✅ DONE (2026-03-18) |
| 9 | Testes behavior: studentPortal | - | Nenhuma | ✅ DONE (2026-03-18) |
| 10 | Dead code cleanup | - | Nenhuma | ✅ DONE (2026-03-18) |
| 11 | Security review | - | Nenhuma | - |
| 12 | Testes smoke: scheduling, progressCheckins, studentPortal | - | Backend rodando | ✅ DONE (2026-03-18) |

**Nota:** Tarefas 1-5 sao sequenciais. Tarefas 6-10 podem ser feitas em paralelo.

---

## Decisoes Tomadas (2026-03-18)

1. **Enums**: backend retorna `{ value, label }` com label em PT-BR
2. **Bulk availability**: parcial — cria os validos, ignora conflitos (comportamento atual do wizard)
3. **Marketing page**: criar testes behavior (mock). Smoke fica para o futuro
4. **N+1 reorder**: manter como esta — listas pequenas, mudancas raras
5. **Labels hardcoded**: se usado em mais de 1 feature → `shared/`. Se apenas 1 feature → nivel de feature
