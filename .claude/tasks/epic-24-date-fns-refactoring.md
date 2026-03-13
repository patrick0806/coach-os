# Épico 24 — Padronização de Manipulação de Datas com date-fns

**Status:** `[x]` done
**Prioridade:** MÉDIA
**Responsáveis:** Snape (Backend)

> **Objetivo:** Eliminar manipulações manuais de datas (aritmética de milissegundos, `toISOString().split('T')[0]`, etc.) no backend, substituindo-as pela biblioteca `date-fns`. Isso garante maior robustez contra problemas de fuso horário, anos bissextos e melhora a legibilidade do código.

---

## 🎙️ Perspectivas dos Especialistas

### 🧪 Severus Snape (Backend)
*"Aritmética de datas feita à mão é uma receita para o desastre. Um erro de um milissegundo ou uma confusão de fuso horário e todo o sistema de agendamento desmorona. Exijo precisão absoluta usando `date-fns` em todo o projeto."*

---

## 📋 Locais Identificados para Refatoração

### 1. Módulo: Auth (Cadastro)
- [x] `backend/src/modules/auth/contexts/register/register.service.ts`
    - **Função:** `execute`
    - **Mudança:** Substituir `setDate(getDate() + 30)` por `addDays(now, 30)`.

### 2. Módulo: Admin (Dashboard)
- [x] `backend/src/modules/admin/dashboard/get-stats/get-stats.service.ts`
    - **Função:** `resolvePeriod`
    - **Mudança:** Substituir o cálculo de milissegundos por `subDays(now, daysBack)`.

### 3. Módulo: Training Schedule (Engine e Histórico)
- [x] `backend/src/modules/training-schedule/contexts/activity-history/activity-history.service.ts`
    - **Função:** `execute`
    - **Mudança:** Substituir `setDate(getDate() - days)` por `subDays` e usar `format(date, 'yyyy-MM-dd')`.
- [x] `backend/src/modules/training-schedule/contexts/schedule-engine/schedule-engine.service.ts`
    - **Função:** `generateSessionDates`
    - **Mudança:** Substituir loops de `setUTCDate` por `addDays` ou `addWeeks` e usar `format` para strings ISO.

### 4. Módulo: Bookings (Agendamentos Legados)
- [x] `backend/src/modules/bookings/available-slots/available-slots.service.ts`
    - **Função:** `execute`
    - **Mudança:** Substituir o parsing manual e `getUTCDay` por funções do `date-fns`.
- [x] `backend/src/modules/bookings/booking-series/booking-series.service.ts`
    - **Funções:** `toIsoDate` e `buildRecurringDates`
    - **Mudança:** Substituir concatenação de strings por `format` e aritmética de dias por `addDays`.

### 5. Módulo: Workout Sessions (Gamificação e Streaks)
- [x] `backend/src/modules/workout-sessions/streak/streak.service.ts`
    - **Funções:** `calculateNewStreak` e `todayUTCString`
    - **Mudança:** Substituir `Date.UTC` e cálculo de `diffDays` por `differenceInDays`. Usar `format` para a string de hoje.

### 6. Módulo: Personals (Perfil e Disponibilidade Pública)
- [x] `backend/src/modules/personals/contexts/public-profile/get-available-slots/get-available-slots.service.ts`
    - **Função:** `execute`
    - **Mudança:** Substituir `new Date(date + "T00:00:00").getDay()` por `getDay(parseISO(date))`.

### 7. Módulo: Subscriptions (Stripe e Assinaturas)
- [x] `backend/src/modules/subscriptions/webhook/webhook.service.ts`
    - **Função:** `handleSubscriptionUpdated`
    - **Mudança:** Substituir `new Date(timestamp * 1000)` por `fromUnixTime`.
- [x] `backend/src/modules/subscriptions/get-subscription/get-subscription.service.ts`
    - **Função:** `execute`
    - **Mudança:** Substituir comparações de `.getTime()` por `isAfter`, `isBefore` ou `differenceInDays`.

---

## ✅ Critérios de Aceite
- [x] Nenhuma ocorrência de `24 * 60 * 60 * 1000` para cálculo de dias.
- [x] Uso consistente de `format` do `date-fns` para strings `YYYY-MM-DD`.
- [x] Todos os testes existentes (especialmente `streak` e `schedule-engine`) devem passar sem alterações na lógica de negócio, apenas na implementação técnica.
- [x] Garantir que o fuso horário (UTC vs Local) seja tratado explicitamente onde necessário.
