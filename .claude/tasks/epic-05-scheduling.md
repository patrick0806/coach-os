# Epic 05 — Agenda e Agendamentos

Status: `[x]` done (backend)

> **Revisao aplicada:** ver [architectural-review.md](architectural-review.md)
> Todos os repositories com escopo de tenant recebem `tenantId = currentUser.personalId`.
> Bookings: para PERSONAL, `tenantId = profileId`. Para STUDENT, `tenantId = personalId` (o coach).

---

## US-011 — Personal configura disponibilidade

**Status:** `[x]` done (backend)
**Sprint:** 4
**Dependencias:** US-002

**Descricao:**
Como personal trainer, quero configurar meus horarios disponiveis por dia da semana para que alunos possam agendar sessoes nos horarios corretos.

### Criterios de Aceite
- [ ] Configurar slots por dia da semana (0=Domingo a 6=Sabado) com horario inicio e fim (formato HH:mm)
- [ ] Multiplos slots por dia
- [ ] Ativar/desativar slots sem excluir
- [ ] Visualizar todos os slots configurados organizados por dia

### Diretivas de Implementacao
- Modulo: `src/modules/scheduling/`
- Contexts: `availability/list/`, `availability/create/`, `availability/update/`, `availability/delete/`
- `AvailabilityRepository`

### Subtasks Backend
- [x] `GET /availability` — listar slots do personal autenticado
- [x] `POST /availability` — criar slot (body: `{ dayOfWeek, startTime, endTime }`)
- [x] `PATCH /availability/:id` — atualizar slot (startTime, endTime, isActive)
- [x] `DELETE /availability/:id` — excluir slot
- [x] `AvailabilityRepository` com: `findByPersonalId`, `create`, `update`, `delete`, `findConflicting`
- [x] Validar que `startTime < endTime`
- [x] Validar conflito de horários sobrepostos no mesmo dia
- [x] Unit tests para cada context

### Subtasks Frontend
- [ ] Rota: `/dashboard/schedule/availability`
- [ ] Grid por dia da semana (seg a dom)
- [ ] Adicionar/remover horarios por dia
- [ ] Toggle ativo/inativo por slot
- [ ] Input de horario com mascara HH:mm

### Notas Tecnicas
- `startTime` e `endTime` no formato `HH:mm` (varchar(5) no schema)
- Validar no backend que nao ha conflito de horarios para o mesmo dia
- **Tenant isolation:** `AvailabilityRepository` sempre filtra por `personalId = tenantId`
- Incluir caso de teste: tentar editar slot de outro personal → 404

---

## US-012 — Personal cria planos de servico

**Status:** `[x]` done (backend)
**Sprint:** 4
**Dependencias:** US-002

**Descricao:**
Como personal trainer, quero criar planos de atendimento (ex: 3x/semana, 60 min) para ofertar pacotes estruturados na minha landing page.

### Criterios de Aceite
- [ ] Campos: nome, descricao, sessoes por semana, duracao em minutos, preco
- [ ] Listar, editar e desativar planos de servico
- [ ] Planos ativos aparecem na landing page publica (US-004)
- [ ] Preco formatado em BRL

### Diretivas de Implementacao
- Contexts: `service-plans/create/`, `service-plans/list/`, `service-plans/update/`, `service-plans/deactivate/`
- `ServicePlansRepository`

### Subtasks Backend
- [x] `POST /service-plans` — criar plano de servico
- [x] `GET /service-plans` — listar do personal autenticado
- [x] `PATCH /service-plans/:id` — atualizar
- [x] `DELETE /service-plans/:id` — desativar (soft delete via `isActive`)
- [x] `ServicePlansRepository` com CRUD
- [x] Unit tests para cada context

### Subtasks Frontend
- [ ] Rota: `/dashboard/service-plans`
- [ ] Cards com resumo do plano (nome, sessoes/semana, duracao, preco)
- [ ] Formulario de criacao/edicao com React Hook Form + Zod
- [ ] Toggle ativo/inativo
- [ ] Preco com mascara de moeda (BRL)

### Notas Tecnicas
- `price` no schema e `numeric(10,2)` — retornar como string do backend, converter no frontend
- Sessoes por semana: inteiro de 1 a 7
- **Tenant isolation:** `ServicePlansRepository` filtra por `personalId = tenantId` em todos os metodos

---

## US-013 — Aluno agenda uma sessao

**Status:** `[x]` done (backend)
**Sprint:** 4
**Dependencias:** US-006, US-011, US-012

**Descricao:**
Como aluno, quero agendar uma sessao com meu personal para confirmar minha presenca em um horario disponivel.

### Criterios de Aceite
- [ ] Visualizar horarios disponiveis do personal para uma data especifica
- [ ] Selecionar data, horario e plano de servico
- [ ] Impedir duplo agendamento no mesmo horario (constraint: `uniq_booking_time`)
- [ ] Aluno recebe confirmacao por e-mail (Resend)
- [ ] Personal recebe notificacao de novo agendamento
- [ ] Status inicial: `scheduled`

### Subtasks Backend
- [x] `GET /bookings/available-slots?date=YYYY-MM-DD` — retorna slots disponiveis do personal para a data (baseado em `availability_slots` menos bookings ja existentes)
- [x] `POST /bookings` — criar agendamento (body: `{ servicePlanId, scheduledDate, startTime, endTime }`)
- [x] `GET /bookings/me` — agendamentos do aluno autenticado (paginado)
- [x] E-mail de confirmacao para aluno via Resend (fire-and-forget)
- [x] `BookingsRepository` com: `create`, `findAvailableSlots`, `findByStudent`, `findConflict`
- [x] Unit tests

### Subtasks Frontend
- [ ] Rota: `/{personal-slug}/students/schedule`
- [ ] Calendário semanal com slots disponiveis
- [ ] Selecao de plano de servico
- [ ] Resumo do agendamento antes de confirmar
- [ ] Feedback de sucesso com detalhes da sessao agendada

### Notas Tecnicas
- `findAvailableSlots`: buscar todos os `availability_slots` ativos WHERE `personalId = tenantId` para o dia da semana da data, subtrair bookings com status `scheduled` naquela data e horario
- O personal e identificado pelo `currentUser.personalId` do JWT do aluno (mesmo campo que identifica o tenant)
- Para o aluno, `tenantId = currentUser.personalId` (o ID do coach — ja vem no JWT conforme revisao arquitetural)
- O studentId para criar o booking vem de `currentUser.profileId`

---

## US-014 — Personal gerencia agendamentos

**Status:** `[x]` done (backend)
**Sprint:** 4
**Dependencias:** US-013

**Descricao:**
Como personal trainer, quero visualizar e gerenciar minha agenda de sessoes para acompanhar atendimentos, confirmar e cancelar.

### Criterios de Aceite
- [ ] Visualizar agendamentos por semana ou mes
- [ ] Detalhes: aluno, horario, plano de servico, notas
- [ ] Acoes: marcar como `completed`, `cancelled`, `no-show`
- [ ] Cancelamento exige motivo
- [ ] Filtrar por status e periodo

### Subtasks Backend
- [x] `GET /bookings?status=&from=&to=&page=&size=` — listar agendamentos do personal (paginado)
- [x] `GET /bookings/:id` — detalhe do agendamento
- [x] `PATCH /bookings/:id/status` — atualizar status (`completed`, `no-show`)
- [x] `PATCH /bookings/:id/cancel` — cancelar (body: `{ reason: string }`)
- [x] `BookingsRepository` com: `findByPersonal`, `findById`, `updateStatus`, `cancel`
- [x] Guard: nao permite alterar status de booking ja cancelado
- [x] Unit tests

### Subtasks Frontend
- [ ] Rota: `/dashboard/schedule`
- [ ] Calendario com visualizacao semanal e mensal
- [ ] Cards de sessao com cor por status
- [ ] Modal de detalhe com acoes
- [ ] Filtros por status e periodo

### Notas Tecnicas
- Status validos: `scheduled`, `completed`, `cancelled`, `no-show`
- Ao cancelar, preencher `cancelledAt` e `cancellationReason` no registro
- Nao permitir alterar status de bookings ja cancelados
- **Tenant isolation:** `BookingsRepository` filtra por `personalId = tenantId` em todos os metodos
- Incluir caso de teste: personal tentando gerenciar booking de outro tenant → 404
