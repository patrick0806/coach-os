# Épico 24 — Padronização de Manipulação de Datas com date-fns

**Status:** `[ ]` todo
**Prioridade:** MÉDIA
**Responsáveis:** Snape (Backend)

> **Objetivo:** Eliminar manipulações manuais de datas (aritmética de milissegundos, `toISOString().split('T')[0]`, etc.) no backend, substituindo-as pela biblioteca `date-fns`. Isso garante maior robustez contra problemas de timezone, anos bissextos e melhora a legibilidade do código.

---

## 🎙️ Perspectivas dos Especialistas

### 🧪 Severus Snape (Backend)
*"Aritmética de datas feita à mão é uma receita para o desastre. Um erro de um milissegundo ou uma confusão de fuso horário e todo o sistema de agendamento desmorona. Exijo precisão absoluta usando `date-fns` em todo o projeto."*

---

## 📋 Locais Identificados para Refatoração

### 1. Aritmética de Dias e Prazos
- [ ] `backend/src/modules/auth/contexts/register/register.service.ts`: Cálculo de `trialEndsAt` (+30 dias).
- [ ] `backend/src/modules/admin/dashboard/get-stats/get-stats.service.ts`: Cálculo de `since` usando milissegundos (`24 * 60 * 60 * 1000`).
- [ ] `backend/src/modules/training-schedule/contexts/activity-history/activity-history.service.ts`: Cálculo de range de histórico.

### 2. Geração de Séries e Recorrências (O mais crítico)
- [ ] `backend/src/modules/training-schedule/contexts/schedule-engine/schedule-engine.service.ts`: Lógica de expansão de regras (`generateSessionDates`).
- [ ] `backend/src/modules/bookings/booking-series/booking-series.service.ts`: Geração de datas recorrentes.
- [ ] `backend/src/shared/repositories/training-sessions.repository.ts`: Cálculo de `endStr` para visualização semanal.

### 3. Formatação e Parsing
- [ ] Substituir `toISOString().split("T")[0]` por `format(date, 'yyyy-MM-dd')` em:
    - `backend/src/modules/workout-sessions/streak/streak.service.ts`
    - `backend/src/shared/repositories/booking-series.repository.ts`
    - `backend/src/modules/training-schedule/contexts/activity-history/activity-history.service.ts`

### 4. Lógica de Streak (Gamificação)
- [ ] `backend/src/modules/workout-sessions/streak/streak.service.ts`: Substituir o cálculo manual de `diffDays` por `differenceInDays`.

### 5. Scripts de Suporte
- [ ] `backend/src/config/database/seed.ts`: Limpar a lógica complexa de busca da "próxima segunda-feira" e iteração de datas.

---

## ✅ Critérios de Aceite
- [ ] Nenhuma ocorrência de `24 * 60 * 60 * 1000` para cálculo de dias.
- [ ] Uso consistente de `format` do `date-fns` para strings `YYYY-MM-DD`.
- [ ] Todos os testes existentes (especialmente `streak` e `schedule-engine`) devem passar sem alterações na lógica de negócio, apenas na implementação técnica.
- [ ] Garantir que o fuso horário (UTC vs Local) seja tratado explicitamente onde necessário.
