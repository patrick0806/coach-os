# Epic 19 — Atendimento e Execução Gamificada

Status: `[x]` done

> **Visão Premium:** Transformar o treino em uma experiência imersiva e viciante. O foco é reduzir a fricção operacional (marcar como feito) e aumentar a dopamina (streaks e visual high-end).

---

## Plano de Implementação Técnica

### Mudanças no Banco de Dados (Drizzle Schema)

1.  **Tabela `service_plans`:**
    *   Adicionar `attendance_type`: `text` (enum: `online`, `presential`, `residential`).
2.  **Tabela `workout_sessions` (Nova):**
    *   `id`: uuid (PK)
    *   `student_id`: uuid (FK students)
    *   `workout_plan_id`: uuid (FK workout_plans - instância do aluno)
    *   `status`: text (`active`, `completed`)
    *   `current_step`: integer (índice do exercício atual para retomar)
    *   `started_at`: timestamp
    *   `completed_at`: timestamp
3.  **Tabela `student_stats` (Nova ou Extensão de `students`):**
    *   `current_streak`: integer (default 0)
    *   `last_workout_date`: date
    *   `total_workouts`: integer

---

## US-055 — Tipos de Atendimento nos Planos de Serviço

**Status:** `[x]` done
**Sprint:** 19

### Tarefas Backend
- [x] Criar migration para `attendance_type` em `service_plans`.
- [x] Atualizar `CreateServicePlanDto` e `UpdateServicePlanDto` com validação Zod.
- [x] Ajustar `ServicePlansRepository` para persistir o novo campo.

### Tarefas Frontend
- [x] Adicionar `Select` com ícones (WiFi, Home, Users) no formulário de criação de planos.
- [x] Criar componente `AttendanceBadge` com efeito glassmorphism.
- [x] Renderizar o badge nos cards de planos da Landing Page e do Painel.

---

## US-056 — Modo Player: Execução Imersiva de Treino

**Status:** `[x]` done
**Sprint:** 19

### Tarefas Backend
- [x] Criar migration da tabela `workout_sessions`.
- [x] Endpoint `POST /workout-sessions/start`: Verifica se já existe sessão ativa (retoma) ou cria nova.
- [x] Endpoint `PATCH /workout-sessions/:id/step`: Atualiza o exercício atual (`current_step`).
- [x] Endpoint `POST /workout-sessions/:id/complete`: Finaliza a sessão e calcula o tempo total.

### Tarefas Frontend
- [x] **Layout `ModoPlayer`:** Rota `app/[slug]/alunos/treinos/[id]/executar`. Layout em tela cheia sem sidebar/navbar.
- [x] **Componente `ExerciseStep`:**
    - Cabeçalho com barra de progresso fina e elegante.
    - Área central: Mídia (Vídeo/GIF) + Título + Carga/Séries/Reps grandes.
    - Área inferior fixa: Botão "Concluir" (destaque primário) + Botão "Pular/Próximo".
- [x] **Timer de Descanso:** Overlay circular elegante que aparece automaticamente após "Concluir" (configurável).
- [x] **Sincronização:** Salvar o progresso no backend a cada mudança de exercício.

---

## US-057 — Gamificação e Streaks (Retenção)

**Status:** `[x]` done
**Sprint:** 19

### Tarefas Backend
- [x] Implementar `StreakService`:
    - Se `hoje - last_workout_date == 1 dia`, incrementa streak.
    - Se `== 0 dias` (mesmo dia), mantém.
    - Se `> 1 dia`, reseta para 1.
- [x] Integrar o cálculo no fluxo de `complete_workout`.

### Tarefas Frontend
- [x] **Dashboard do Aluno:** Adicionar widget `StreakCounter` (Ícone de fogo pulsante + número).
- [x] **Feedback de Conclusão:**
    - Modal de "Treino Finalizado" com confetes (`canvas-confetti`).
    - Resumo: "Você treinou por 45 minutos. 🔥 5 dias seguidos!".
- [x] **Notificações:** Toast motivacional ao abrir o app se estiver prestes a quebrar o streak.

---

## Critérios de Qualidade (UI/UX)
- **Contraste:** Garantir que no escuro da academia o "Modo Player" seja legível sem ofuscar.
- **Feedback Tátil:** Vibrar levemente o celular (se suportado) ao concluir um exercício.
- **Consistência:** Usar `rounded-3xl` em todos os containers do player para manter o estilo premium.
