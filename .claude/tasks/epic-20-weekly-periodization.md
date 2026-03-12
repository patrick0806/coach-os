# Epic 20 — Periodização e Cronograma Semanal

Status: `[ ]` todo

> **Visão Premium:** Um calendário de elite. O aluno abre o app e vê exatamente o caminho do sucesso para a semana, com cards elegantes e indicação clara de dias de treino vs. dias de descanso.

---

## Plano de Implementação Técnica

### Mudanças no Banco de Dados (Drizzle Schema)

1.  **Tabela `workout_schedules` (Nova):**
    *   `id`: uuid (PK)
    *   `student_id`: uuid (FK students)
    *   `workout_plan_id`: uuid (FK workout_plans - opcional, null pode significar descanso)
    *   `day_of_week`: integer (0-6, onde 0 = Domingo)
    *   `notes`: text (ex: "Foco em progressão de carga" ou "Cardio em jejum")
    *   `is_rest_day`: boolean (se for true, ignora o workout_plan_id)

---

## US-058 — Organização Semanal (Visão do Personal)

**Status:** `[ ]` todo
**Sprint:** 20
**Dependencias:** US-054

**Descricao:**
Como personal, quero definir o que meu aluno treinará em cada dia da semana para que eu possa periodizar o treinamento de forma profissional e organizada.

### Criterios de Aceite
- [ ] Grade de 7 dias (Seg-Dom) na aba de treinos do aluno.
- [ ] Possibilidade de atribuir um treino específico para um ou mais dias.
- [ ] Opção de marcar dias como "Descanso".
- [ ] Adição de notas rápidas por dia (ex: "Fazer 20 min de esteira após").

### Tarefas Backend
- [ ] Criar migration para `workout_schedules`.
- [ ] Endpoint `PUT /students/:id/workout-schedule`: Atualiza a grade semanal completa do aluno (bulk update).
- [ ] Garantir que o `workout_plan_id` pertença ao personal/tenant.

### Tarefas Frontend
- [ ] **UI `WeeklyPlanner`:** Uma grade horizontal ou vertical elegante.
- [ ] **Interação:** Seletor (Dropdown ou Modal) em cada dia da semana para escolher entre os treinos atribuídos ao aluno ou "Descanso".
- [ ] Indicadores visuais de "Treino A", "Treino B", etc., nos dias da grade.

---

## US-059 — Dashboard de Treino do Dia (Visão do Aluno)

**Status:** `[ ]` todo
**Sprint:** 20
**Dependencias:** US-058, US-056

**Descricao:**
Como aluno, quero que o Dashboard destaque automaticamente o treino agendado para hoje, para que eu possa iniciar minha rotina com um único clique.

### Criterios de Aceite
- [ ] O Dashboard do Aluno deve ler o cronograma e exibir:
    - Se hoje tem treino: Card de destaque "Treino de Hoje: [Nome]" com botão "Iniciar".
    - Se hoje é descanso: Card elegante "Hoje é dia de descanso. Recupere-se bem! 🔋".
- [ ] Visualização da "Minha Semana": Um scroller horizontal no topo com os dias e o que está planejado para cada um.

### Tarefas Frontend
- [ ] Lógica para identificar o `day_of_week` atual e filtrar o cronograma.
- [ ] Implementar o `WeeklyScroller` (mini calendário semanal) no topo do Dashboard.
- [ ] Integrar o botão "Iniciar" do cronograma com o Modo Player (US-056).

---

## US-060 — Notificações e Lembretes de Cronograma

**Status:** `[ ]` todo
**Sprint:** 20

**Descricao:**
Como aluno, quero ser lembrado do que tenho para treinar hoje para manter o engajamento e a disciplina.

### Criterios de Aceite
- [ ] Sistema de notificações (inicialmente Toast ou In-app) ao abrir o sistema.
- [ ] Integração futura com e-mail/push (conforme infraestrutura permitir).

---

## Detalhes de UX e Estilo Premium
- **Glassmorphism nos Cards:** Os cards de cada dia no cronograma devem ter transparência e bordas finas com brilho suave (`border-primary/20`).
- **Estados Vazios:** Se o personal não definiu cronograma, exibir um estado "Livre" ou convite para o personal configurar.
- **Animações de Transição:** Ao mudar de dia no cronograma, usar transições suaves de opacidade (`framer-motion`).
- **Ergonomia Mobile:** O `WeeklyScroller` deve ser deslizante com o polegar, com o dia atual centralizado automaticamente.
