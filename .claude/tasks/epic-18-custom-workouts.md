# Epic 18 — Treinos Customizados e Independentes

Status: `[ ]` todo

---

## US-054 — Treinos Customizados e Independentes por Aluno

**Status:** `[ ]` todo
**Sprint:** 11 (Evolução)
**Dependencias:** US-028

**Descricao:**
Como personal, quero poder criar treinos do zero para um aluno ou clonar um template existente e customizá-lo (peso, descanso, ordem, etc) especificamente para aquele aluno, sem que as alterações afetem o modelo original.

### Criterios de Aceite
- [ ] Possibilidade de criar um treino `student` do zero a partir da tela do aluno.
- [ ] Ao atribuir um template a um aluno, o sistema deve realizar uma **clonagem** (cópia física) dos dados.
- [ ] Edição de parâmetros específicos por aluno na instância clonada:
    - Carga (Peso)
    - Séries e Repetições
    - Tempo de Descanso (novo campo)
    - Tempo de Execução/Duração (novo campo)
    - Ordem dos exercícios
    - Observações por exercício
- [ ] UI deve indicar claramente se o treino é derivado de um template ou manual.

### Subtasks Backend
- [ ] Migration: adicionar `rest_time` (varchar 50) e `execution_time` (varchar 50) em `workout_exercises`.
- [ ] Garantir que `POST /workout-plans/:id/apply` realiza a cópia profunda de todos os exercícios com os novos campos.
- [ ] Endpoint para criação de `workout_plans` com `planKind: 'student'` diretamente vinculado a um aluno (sem template).
- [ ] Unit tests para lógica de clonagem e novos campos.

### Subtasks Frontend
- [ ] Na tela de detalhes do aluno (Aba Treinos), adicionar botões:
    - "Atribuir de Template" (abre listagem de modelos).
    - "Criar Treino Manual" (abre builder vazio vinculado ao aluno).
- [ ] Atualizar Builder de Treinos para suportar os campos:
    - Tempo de Descanso.
    - Tempo de Execução.
- [ ] Garantir que a edição de um treino do tipo `student` não altere o `template` de origem.
