# BUG-002 — Falhas na Visualização de Agenda e Slots Disponíveis (LP)

**Status:** `[ ]` todo
**Prioridade:** ALTA
**Relatado em:** 2026-03-12
**Módulos:** `frontend/painel`, `frontend/lp`, `backend/bookings`

## 📝 Descrição do Bug / Melhoria
Existem três falhas principais na experiência de agendamento e visualização do Personal:

1.  **Rota de `available-slots` na LP:** A Landing Page do Personal não está consumindo corretamente os horários disponíveis. A exibição atual está baseada em datas específicas (12, 13, 14...) em vez de um padrão semanal (Segunda a Sexta), o que confunde o visitante.
2.  **Agenda do Personal Vazia/Incompleta:** A aba "Agenda" no painel do Personal não mostra um resumo claro dos compromissos. O Personal precisa ver hoje, amanhã e a semana de forma intuitiva ("Hoje" deve ser o foco inicial).
3.  **Lógica de Slots Disponíveis:** Na LP, o sistema deve mostrar apenas horários onde o Personal **não tem** agendamentos presenciais marcados, filtrando com base nas `availability_slots` menos as `schedule_rules/training_sessions` do tipo presencial.

## 🔍 Análise Inicial
- O backend possui um `AvailableSlotsService`, mas ele parece estar atrelado ao módulo de `bookings` antigo e espera uma `date` específica em vez de retornar um padrão de disponibilidade semanal.
- O frontend (`AgendaPage`) está dividido entre "Agendamentos" (vindo de `bookings`) e "Calendário de Treinos" (vindo de `training-sessions`), causando uma visão fragmentada e muitas vezes vazia se um dos sistemas não estiver populado.

## 🎯 Solução Proposta (Integrada ao Épico 23)
1.  **Backend:** Criar um endpoint `GET /personals/:slug/weekly-availability` que retorne o padrão de Segunda a Sexta, já subtraindo os treinos presenciais fixos (`schedule_rules`).
2.  **Frontend (LP):** Atualizar o componente de agendamento para exibir os dias da semana (Segunda a Sexta) e seus respectivos slots livres.
3.  **Frontend (Agenda):** Refatorar a `AgendaPage` para unificar as fontes de dados e priorizar a visão de "Hoje" com um resumo claro de todos os compromissos (Agendamentos + Treinos).

## ✅ Critérios de Aceite
- [ ] Landing Page exibe slots por dia da semana (Seg-Sex), não por datas fixas.
- [ ] Slots na LP ocultam horários ocupados por treinos presenciais.
- [ ] Aba Agenda no Painel abre por padrão na visão de "Hoje" com todos os compromissos unificados.
- [ ] Personal consegue ver um resumo semanal/mensal claro de sua ocupação.

{
    "timestamp": "2026-03-12T20:42:39.919Z",
    "status": 404,
    "error": "NOT_FOUND",
    "path": "/api/v1/personals/personal-trainer/available-slots?date=2026-03-15",
    "transactionId": null,
    "message": "Cannot GET /api/v1/personals/personal-trainer/available-slots?date=2026-03-15"
}