# Epic 10 — Agenda e Produtividade do Personal

Status: `[ ]` todo

---

## US-024 — Personal cria sessao avulsa ou recorrente vinculada a aluno

**Status:** `[ ]` todo
**Sprint:** 8
**Dependencias:** US-014

**Descricao:**
Como personal, quero criar uma sessao para um aluno diretamente na minha agenda — de forma avulsa (uma unica vez) ou recorrente (ex: toda segunda, quarta e sexta) — para nao precisar criar cada sessao manualmente toda semana. Tambem quero poder excluir uma sessao especifica ou a serie inteira quando necessario.

---

### Modelo de Dados — Novas Tabelas

#### `booking_series`
Armazena a regra de recorrencia. Cada serie gera multiplos `bookings`.

| Campo | Tipo | Descricao |
|-------|------|-----------|
| `id` | uuid PK | |
| `personal_id` | uuid FK | tenant |
| `student_id` | uuid FK | |
| `service_plan_id` | uuid FK | |
| `days_of_week` | int[] | dias da semana (0=dom, 1=seg, ..., 6=sab) |
| `start_time` | time | horario de inicio de cada sessao |
| `end_time` | time | horario de termino |
| `series_start_date` | date | primeira data de geracao |
| `series_end_date` | date | ultima data (obrigatorio — maximo 6 meses a frente) |
| `notes` | text nullable | nota aplicada a todas as sessoes da serie |
| `created_at` | timestamp | |

#### Tabela `bookings` — alteracao
- Adicionar `series_id` (uuid FK nullable para `booking_series`)
- Sessoes avulsas tem `series_id = null`
- Sessoes de serie tem `series_id` preenchido

---

### Criterios de Aceite

#### Criacao — Sessao Avulsa
- [ ] Personal pode criar uma unica sessao com: aluno, plano de servico, data, horario, nota opcional
- [ ] Apenas alunos do proprio tenant aparecem no seletor
- [ ] Validacao de conflito de horario (booking ja existente no mesmo slot)
- [ ] Sessao criada aparece no painel do aluno em "Proximas sessoes"

#### Criacao — Sessao Recorrente
- [ ] Personal pode alternar entre modo "Sessao unica" e "Recorrente" no formulario
- [ ] No modo recorrente, campos adicionais:
  - Dias da semana (checkboxes: Seg / Ter / Qua / Qui / Sex / Sab / Dom)
  - Horario de inicio e fim
  - Data de inicio e data de termino da serie (maximo 6 meses)
- [ ] Ao confirmar, o sistema gera automaticamente todas as sessoes nos dias marcados entre as datas informadas
- [ ] Preview antes de confirmar: "Serao criadas X sessoes entre [data inicio] e [data fim]"
- [ ] Conflitos na geracao: se qualquer slot gerado ja tiver booking, rejeitar toda a operacao com mensagem indicando quais datas conflitam
- [ ] Todas as sessoes geradas aparecem na agenda e no painel do aluno

#### Exclusao — Sessao Avulsa ou Sessao Sem Serie
- [ ] Personal pode excluir uma sessao qualquer individualmente
- [ ] Sessao excluida some da agenda e do painel do aluno

#### Exclusao — Sessao Pertencente a uma Serie
- [ ] Ao tentar excluir uma sessao de uma serie, exibir dialogo de confirmacao com 3 opcoes:
  1. **"Somente esta sessao"** — exclui apenas o booking selecionado, serie permanece
  2. **"Esta e as proximas"** — exclui o booking selecionado e todos os futuros da mesma serie
  3. **"Toda a serie"** — exclui todos os bookings da serie (passados e futuros) + o registro `booking_series`
- [ ] Opcao "cancelar" sempre disponivel no dialogo
- [ ] Sessoes ja concluidas (`status = completed`) nao sao afetadas por exclusoes em lote (opcoes 2 e 3 preservam sessoes concluidas)

---

### Subtasks Backend

- [ ] Migration: criar tabela `booking_series` com campos descritos acima
- [ ] Migration: adicionar coluna `series_id` (FK nullable) em `bookings`

- [ ] `POST /bookings/personal` — sessao avulsa (role `PERSONAL`)
  - Body: `{ studentId, servicePlanId, scheduledAt, notes? }`
  - Validar aluno pertence ao tenant
  - Validar conflito de horario
  - Unit tests: happy path, conflito de horario, aluno de outro tenant

- [ ] `POST /booking-series` — criar serie recorrente (role `PERSONAL`)
  - Body: `{ studentId, servicePlanId, daysOfWeek: number[], startTime, endTime, seriesStartDate, seriesEndDate, notes? }`
  - Validacoes: daysOfWeek nao vazio, startDate < endDate, endDate <= startDate + 6 meses
  - Logica: gerar lista de datas, checar conflitos de todos os slots em batch, inserir `booking_series` + todos os `bookings` em transacao
  - Retorna: `{ seriesId, sessionsCreated: number, sessions: BookingSummary[] }`
  - Unit tests: geracao correta por dias da semana, rejeicao por conflito (com lista de datas conflitantes), limite de 6 meses, transacao atomica

- [ ] `DELETE /bookings/:id` — excluir sessao avulsa ou sessao de serie (role `PERSONAL`)
  - Query param: `?scope=single|future|all` (obrigatorio quando booking tem `series_id`)
  - `single`: delete apenas este booking
  - `future`: delete este + proximos da serie com `scheduledAt >= agora` e `status != completed`
  - `all`: delete todos da serie com `status != completed` + deleta `booking_series` se nao sobrar nenhum
  - Validar ownership pelo tenant
  - Unit tests para cada scope, protecao de sessoes concluidas

- [ ] `GET /booking-series` — listar series ativas do personal (role `PERSONAL`)
  - Retorna lista com resumo: aluno, dias da semana, horario, periodo, total de sessoes pendentes

- [ ] Atualizar `GET /bookings` para incluir campo `seriesId` e indicador `isRecurring` no response

### Subtasks Frontend

- [ ] Formulario "Adicionar sessao" em `/painel/agenda` com toggle "Sessao unica / Recorrente"

- [ ] Modo Sessao Unica:
  - Campos: aluno, plano de servico, data, horario, nota
  - Validacao client-side antes de enviar

- [ ] Modo Recorrente:
  - Checkboxes de dias da semana (visualmente destacados quando selecionados)
  - Inputs de horario inicio/fim com mascara HH:mm
  - Date pickers para data inicio e fim da serie
  - Preview dinamico: "X sessoes serao criadas" (calculado no frontend conforme usuario preenche)
  - Aviso visual se data fim ultrapassar 6 meses

- [ ] Dialog de confirmacao de exclusao para sessoes de serie:
  - 3 opcoes com descricao clara de impacto
  - Opcao default: "Somente esta sessao"

- [ ] Na agenda, sessoes de uma serie exibem indicador visual (ex: icone de recorrencia)
- [ ] Invalidar `['bookings']` e `['booking-series']` apos criacao/exclusao
- [ ] Toasts: "X sessoes criadas" (serie) | "Sessao removida" (avulsa) | "Serie encerrada" (all)

---

## US-025 — Notas de sessao e historico rapido

**Status:** `[ ]` todo
**Sprint:** 8
**Dependencias:** US-024

**Descricao:**
Como personal, quero registrar notas curtas por sessao para acompanhar evolucao do atendimento sem abrir tela complexa.

### Criterios de Aceite
- [ ] Personal pode editar nota de uma sessao agendada/concluida
- [ ] Nota visivel no detalhe do agendamento e no historico do aluno
- [ ] Limite de 1000 caracteres com contador e validacao no backend e frontend
- [ ] Nota nao visivel para o aluno (privada ao personal)

### Subtasks Backend
- [ ] `PATCH /bookings/:id/notes` — corpo: `{ notes: string (max 1000) }`
- [ ] Validar ownership do booking pelo personal (tenant isolation)
- [ ] Validar limite de caracteres no DTO com Zod
- [ ] Unit tests: happy path, nota muito longa, booking de outro tenant

### Subtasks Frontend
- [ ] Campo de notas no dialog de detalhe da sessao
- [ ] Contador de caracteres em tempo real (ex: 423/1000)
- [ ] Secao de historico resumido no detalhe do aluno
- [ ] Estados de loading/saving com feedback inline

---

## US-026 — Busca e filtros globais no painel

**Status:** `[ ]` todo
**Sprint:** 9
**Dependencias:** nenhuma

**Descricao:**
Como personal, quero buscar rapidamente alunos, treinos e sessoes para reduzir tempo de navegacao entre modulos.

### Criterios de Aceite
- [ ] Busca global no header do painel (atalho `Ctrl/Cmd + K`)
- [ ] Resultados agrupados por tipo: alunos, treinos, agenda
- [ ] Navegacao direta para a entidade selecionada
- [ ] Filtros basicos por status/data para resultados de agenda
- [ ] Resultados respeitam tenant isolation (apenas dados do personal logado)

### Subtasks Backend
- [ ] Endpoint `GET /search/global?q=...` (tenant-aware via JWT)
- [ ] Query federada leve (students + workout_plans + bookings)
- [ ] Limite de 5 resultados por tipo, ordenacao por relevancia simples
- [ ] Unit tests com mocks de repository por tipo

### Subtasks Frontend
- [ ] Componente de command palette com shadcn `<Command />`
- [ ] Integracao com endpoint de busca (debounce 300ms)
- [ ] Keyboard navigation + acessibilidade (aria-labels, focus trap)
- [ ] Estado vazio e loading skeleton

---

## US-027 — Dashboard operacional simples do personal

**Status:** `[ ]` todo
**Sprint:** 9
**Dependencias:** US-024

**Descricao:**
Como personal, quero metricas operacionais simples para acompanhar meu ritmo semanal sem complexidade de BI.

### Criterios de Aceite
- [ ] Card: sessoes agendadas da semana
- [ ] Card: sessoes concluidas vs no-show (7d/30d)
- [ ] Card: alunos ativos (com pelo menos 1 sessao no periodo)
- [ ] Card: treinos ativos atribuidos
- [ ] Filtro de periodo simples (7d/30d)
- [ ] Dados isolados por tenant

### Subtasks Backend
- [ ] Endpoint `GET /dashboard/personal/stats?period=7d|30d`
- [ ] Agregacoes em repository dedicado (`PersonalDashboardRepository`)
- [ ] Unit tests de calculo para cada metrica (happy path + periodo vazio)

### Subtasks Frontend
- [ ] Evoluir `/painel` com cards de metricas e filtro 7d/30d
- [ ] Skeleton loaders e estado vazio por card
- [ ] Responsividade mobile (grid 1 col mobile, 2 col tablet, 4 col desktop)

---

## US-032 — Configuracao de Disponibilidade em Lote

**Status:** `[ ]` todo
**Sprint:** 8
**Dependencias:** US-011

**Descricao:**
Como personal, quero configurar minha disponibilidade de um dia inteiro de uma vez — definindo horario de inicio, fim, duracao de cada slot e pausa para almoco — e depois copiar essa configuracao para outros dias da semana, para evitar o trabalho manual de criar slot por slot.

**Problema identificado:** A UX atual exige criar cada slot de 1 hora individualmente. Um dia com 8 horas de trabalho significa 8 interacoes separadas. Com copia para 5 dias, sao 40 operacoes que deveriam ser 1.

### Criterios de Aceite

#### Configuracao de Dia em Lote
- [ ] Personal pode abrir um formulario "Configurar dia" para qualquer dia da semana
- [ ] Campos do formulario:
  - Dia da semana (segunda a domingo)
  - Horario de inicio (ex: 09:00)
  - Horario de termino (ex: 18:00)
  - Duracao de cada slot em minutos (ex: 60, 30, 45, 90)
  - Pausa: horario de inicio e fim (ex: 12:00 - 13:00) — opcional
- [ ] Sistema gera automaticamente todos os slots do dia respeitando a pausa
- [ ] Preview dos slots gerados antes de confirmar
- [ ] Ao confirmar, substitui os slots existentes do dia (nao acumula)
- [ ] Validacao: horario de termino deve ser apos inicio, pausa deve estar dentro do intervalo

#### Copia entre Dias
- [ ] Botao "Copiar para outros dias" disponivel em cada dia ja configurado
- [ ] Abre modal com checkboxes dos outros dias da semana
- [ ] Ao confirmar, replica exatamente os mesmos slots (mesmos horarios e duracao) para os dias selecionados
- [ ] Dias destino tem seus slots substituidos (nao acumulados)
- [ ] Preview resumido dos dias que serao afetados antes de confirmar

#### Manutencao Individual (existente)
- [ ] Manter possibilidade de adicionar/remover slots individuais para ajustes pontuais

### Subtasks Backend

- [ ] `POST /availability/bulk` — configura dia completo em lote
  - Body: `{ dayOfWeek: number, startTime: string, endTime: string, slotDurationMinutes: number, breakStart?: string, breakEnd?: string }`
  - Logica: gerar lista de slots, deletar slots existentes do dia, inserir novos em transacao
  - Retorna: lista de slots criados
  - Unit tests: geracao correta, respeito a pausa, substituicao de existentes, validacoes de horario

- [ ] `POST /availability/copy` — copia slots de um dia para outros
  - Body: `{ sourceDayOfWeek: number, targetDays: number[] }`
  - Logica: buscar slots do dia origem, para cada dia destino deletar existentes e inserir copias em transacao
  - Retorna: resumo `{ copiedTodays: number[], slotsCreated: number }`
  - Unit tests: copia correta, substituicao, dia de origem sem slots (erro 404), dias destino invalidos

### Subtasks Frontend

- [ ] Refatorar `/painel/agenda/disponibilidade` — nova UI por dia da semana
  - Layout: lista de dias com seus slots + botoes de acao por dia
  - Botao "Configurar dia" abre formulario em drawer/dialog
  - Botao "Copiar para..." disponivel quando dia ja tem slots

- [ ] Componente `DisponibilidadeDiaForm`
  - Campos com mascaras de horario (HH:mm)
  - Select de duracao do slot (15, 30, 45, 60, 90, 120 min)
  - Toggle de pausa com campos de horario
  - Preview em tempo real: lista dos slots que serao gerados

- [ ] Modal de copia `CopiarDisponibilidadeModal`
  - Checkboxes por dia da semana
  - "Selecionar todos" / "Desmarcar todos"
  - Aviso: "Os slots existentes nos dias selecionados serao substituidos"
  - Botao confirmar com loading

- [ ] Invalidar cache `['availability']` apos operacoes bulk e copy
- [ ] Toasts de sucesso/erro com resumo (ex: "8 slots criados para segunda-feira")

---

