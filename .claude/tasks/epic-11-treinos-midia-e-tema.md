# Epic 11 — Treinos, Midia e Tema

Status: `[x]` done

---

## US-028 — Separar fichas em modelo (generica) e especifica por aluno

**Status:** `[x]` done
**Sprint:** 10
**Dependencias:** US-008, US-009

**Descricao:**
Como personal, quero organizar minhas fichas em modelos reutilizaveis e fichas especificas por aluno para reduzir poluicao na listagem e facilitar a manutencao de treinos padronizados.

### Criterios de Aceite
- [x] Workout plan possui tipo `planKind`: `template` ou `student`
- [x] Ao criar plano, personal escolhe o tipo (padrao: `template`)
- [x] Lista separada em abas: "Modelos" e "Por aluno"
- [x] "Aplicar para aluno" cria copia editavel independente do modelo
- [x] Aba "Por aluno" tem filtro por nome do aluno

### Subtasks Backend
- [x] Migration: `plan_kind` e `source_template_id` em `workout_plans`
- [x] Ajustar `GET /workout-plans?kind=`
- [x] `POST /workout-plans/:id/apply`
- [x] Unit tests

### Subtasks Frontend
- [x] Refatorar `/painel/treinos` com Tabs
- [x] Botao "Aplicar para aluno" com dialog
- [x] Filtro por aluno na aba "Por aluno"

---

## US-029 — Guia visual de execucao em exercicios

**Status:** `[x]` done
**Sprint:** 9
**Dependencias:** US-007

**Descricao:**
Como aluno, quero ver uma demonstracao visual de como executar cada exercicio da minha ficha, para treinar com mais seguranca e sem depender de explicacoes textuais. Como personal, quero enriquecer exercicios customizados com um link do YouTube quando quiser dar uma instrucao mais personalizada.

---

## US-030 — Duplicar ficha/modelo com 1 clique

**Status:** `[x]` done
**Sprint:** 10
**Dependencias:** US-029

**Descricao:**
Como personal, quero duplicar uma ficha rapidamente para criar variacoes sem reconstruir todos os exercicios do zero.

---

## US-031 — Tema dark/light no painel do personal

**Status:** `[x]` done
**Sprint:** 11
**Dependencias:** US-003
