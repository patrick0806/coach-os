# Épico 20 — Agenda Inteligente e Performance (Unified Experience)

**Status:** `[x]` concluído
**Prioridade:** Crítica
**Responsáveis:** Minerva McGonagall (PO), Albus Dumbledore (Arquiteto), Luna Lovegood (Design)

> **Objetivo:** Unificar o planejamento semanal do Personal Trainer com a execução diária do aluno. O sistema agora automatiza a agenda recorrente para os próximos 60 dias, permitindo que a periodização (Treino A, B, C...) seja aplicada de forma inteligente e gamificada, com métricas de retenção (streaks) integradas.

---

## 🎙️ Perspectivas dos Especialistas

### 🧙‍♂️ Albus Dumbledore (Arquitetura)
*"Ao unificar as regras de agendamento com a periodização semanal, eliminamos redundância de dados. Teremos a tabela `schedule_rules` que define o 'Padrão Semanal' (ex: Seg/Qua/Sex às 07:00 com o 'Treino A') e o Cron Job gerará as instâncias em `training_sessions`. Isso garante que o sistema seja escalável e as queries de performance sejam simples."*

### 🌙 Luna Lovegood (Design)
*"O planejamento semanal para o Personal será uma grade visual onde ele 'arrasta' os treinos para os dias da semana. Para o aluno, a experiência é mágica: o 'Treino de Hoje' aparece no topo com um grande botão 'Iniciar'. Quando ele termina, o fogo do streak brilha, dando aquela sensação de missão cumprida."*

### 🧙‍♂️ Minerva McGonagall (Product Owner)
*"O valor de negócio aqui é imenso. O Personal gasta 0 minutos por semana gerindo a agenda de alunos recorrentes e o Aluno se sente acompanhado todos os dias. Focaremos no fluxo: Planejar → Gerar → Executar → Medir."*

---

## 📋 Histórias de Usuário (US)

### US-058 — Planejador Semanal de Elite (Visão Personal)
**Descricao:** Como personal, quero definir o cronograma semanal do meu aluno (dias, horários e quais treinos(horários são apenas para alunos presenciais)) para automatizar a gestão de sessões.

**Criterios de Aceite:**
- [x] Grade de 7 dias para configurar o padrão recorrente.
- [x] Seleção de Treino (ex: Treino A, B, C) e Horário para cada dia.
- [x] Opção de marcar dia como "Descanso".
- [x] Diferenciação visual entre treino "Presencial" e "Online" (Consultoria).

---

### US-059 — Automação de Agenda e Cron (Backend, nestjs cron)
**Descricao:** Como sistema, devo garantir que as sessões de treino estejam criadas até 60 dias à frente com base nas regras do planejador semanal.

**Criterios de Aceite:**
- [x] Cron Job que expande as regras de `schedule_rules` para `training_sessions`.
- [x] Índice único para evitar duplicidade de sessões no mesmo horário.
- [x] Sincronização automática: se o personal altera o planejador semanal, as sessões futuras não iniciadas devem ser atualizadas/recriadas.

---

### US-060 — Dashboard do Aluno e Foco Diário
**Descricao:** Como aluno, quero ver o que tenho planejado para hoje e para a semana de forma clara e motivadora.

**Criterios de Aceite:**
- [x] Widget "Treino de Hoje" com status (Pendente, Concluído, Descanso).
- [x] "Scroller" semanal no topo exibindo a rotina dos próximos 7 dias.
- [x] Botão "Iniciar Treino" proeminente quando houver sessão pendente.

---

### US-061 — Modo Player: Execução Gamificada
**Descricao:** Como aluno, quero uma interface imersiva para realizar meu treino passo a passo, registrando cargas e tempos de descanso.

**Criterios de Aceite:**
- [x] UI de execução (Exercício Atual → Próximo).
- [x] Timer de descanso configurável por exercício.
- [x] Checkpoint de carga usada em cada série.
- [x] Finalização com feedback visual (celebração).

---

### US-062 — Gestão de Sessões e Cancelamentos
**Descricao:** Como personal ou aluno, quero cancelar aulas específicas sem afetar o padrão semanal futuro.

**Criterios de Aceite:**
- [x] Status `cancelled` para sessões individuais na agenda.
- [x] Modal de confirmação ao cancelar uma aula, com opção de "Notificar Aluno".

---

### US-063 — Streaks e Engajamento
**Descricao:** Como aluno, quero ver meu histórico de consistência (sequência de dias treinados) para me manter motivado.

**Criterios de Aceite:**
- [x] Lógica de `current_streak` nos metadados do aluno.
- [x] Histórico visual de treinos concluídos (Calendário de atividade).
- [x] Atualização automática de `total_workouts` e `last_workout_date`.

---

### US-064 — Notificações e Lembretes
**Descricao:** Como sistema, devo lembrar o aluno do seu treino agendado para garantir a disciplina.

**Criterios de Aceite:**
- [x] Toast/Notificação interna ao logar se houver treino hoje.
- [x] Alerta se o streak estiver prestes a quebrar (Ex: "Falta pouco para completar 5 dias seguidos!").

---

## 🛠️ Sub-tarefas de Implementação

- [x] **B1 (Migration):** Tabelas `schedule_rules` e `training_sessions`.
- [x] **B2 (Service):** Motor de geração de datas (Cron Job).
- [x] **B3 (API):** Endpoints de Planejador e Execução de Treino.
- [x] **F1 (UI):** Planejador semanal Draggable/Dropdown no painel do Personal.
- [x] **F2 (UI):** Dashboard do Aluno (Foco diário).
- [x] **F3 (UI):** Modo Player (Framer Motion).
- [x] **F4 (UI):** Widgets de Streak e Estatísticas (ActivityCalendar + toasts).
