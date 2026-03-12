# BUG-005 — Treino de Hoje não aparece no Painel do Aluno

**Status:** `[ ]` todo
**Prioridade:** CRÍTICA
**Relatado em:** 2026-03-12
**Módulo:** `frontend/student-panel`, `backend/training-schedule`

## 📝 Descrição do Bug
No Painel do Aluno, o treino planejado para o dia atual não está sendo carregado corretamente no card principal de execução ("Play"). Embora a barra de "Próximos Treinos" mostre um indicador no dia de hoje, o card central exibe a mensagem: *"Sem treino hoje. Seu personal ainda não configurou a agenda desta semana."*

### Cenário de Reprodução:
1.  O Personal cadastra uma `ScheduleRule` para o aluno na Quinta-feira.
2.  O Aluno acessa seu painel na Quinta-feira.
3.  O sistema mostra o dia 12 com um ponto na lista horizontal, mas o botão de "Iniciar Treino" não aparece.

## 🔍 Causa Raiz (Análise Inicial)
Existem duas possibilidades principais:
1.  **Fuso Horário (Timezone):** O backend pode estar filtrando o treino de "hoje" usando UTC puro, o que pode fazer com que o treino suma dependendo da hora do dia no fuso local (Brasília).
2.  **Filtragem de Status:** O endpoint `getTodaySession` no backend pode estar ignorando sessões que não tenham um `workoutPlanId` vinculado, ou o frontend não está sabendo lidar com sessões que foram geradas mas ainda não "carregaram" o plano.
3.  **Isolamento de Aluno:** O endpoint pode estar buscando sessões de outro `studentId` devido a uma falha na passagem do token de aluno.

## ✅ Critérios de Aceite
- [ ] O card principal do painel do aluno deve exibir o botão de "Iniciar Treino" sempre que houver uma sessão `pending` para a data atual (fuso local).
- [ ] A mensagem "Sem treino hoje" só deve aparecer se realmente não houver sessão planejada.
- [ ] O fuso horário deve ser consistente entre o que o Personal vê na agenda e o que o Aluno vê no painel.
