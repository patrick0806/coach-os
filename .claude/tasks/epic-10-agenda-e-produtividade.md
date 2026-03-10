# Epic 10 — Agenda e Produtividade do Personal

Status: `[~]` in progress

---

## US-032 — Configuracao de Disponibilidade em Lote

**Status:** `[~]` in progress
**Sprint:** 8
**Dependencias:** US-011

**Descricao:**
Como personal, quero configurar minha disponibilidade de um dia inteiro de uma vez — definindo horario de inicio, fim, duracao de cada slot e pausa — e depois copiar essa configuracao para outros dias, para evitar o trabalho manual de criar slot por slot.

### Criterios de Aceite

#### Configuracao de Dia em Lote
- [ ] Personal pode abrir um formulario "Configurar dia" para qualquer dia da semana
- [ ] Campos: dia da semana, horario inicio, horario termino, duracao do slot (min), pausa (opcional)
- [ ] Sistema gera automaticamente todos os slots respeitando a pausa
- [ ] Preview dos slots antes de confirmar
- [ ] Ao confirmar, substitui os slots existentes do dia (nao acumula)
- [ ] Validacao: fim deve ser apos inicio, pausa deve estar dentro do intervalo

#### Copia entre Dias
- [ ] Botao "Copiar para outros dias" disponivel em cada dia ja configurado
- [ ] Modal com checkboxes dos outros dias
- [ ] Confirmacao substitui slots dos dias destino (nao acumula)
- [ ] Preview resumido dos dias afetados

#### Manutencao Individual (existente)
- [ ] Manter possibilidade de adicionar/remover slots individuais para ajustes pontuais

### Subtasks Backend
- [x] `POST /availability/bulk`
- [x] `POST /availability/copy`
- [x] Unit tests

### Subtasks Frontend
- [ ] Refatorar `/painel/agenda/disponibilidade`
- [ ] Componente `DisponibilidadeDiaForm` com preview em tempo real
- [ ] Modal `CopiarDisponibilidadeModal`

---

### Plano de Implementacao — US-032

#### 1. Backend

##### 1.1 Schema — sem migration necessaria
Os endpoints operam sobre a tabela `availability_slots` ja existente. Nenhuma coluna nova e necessaria.

##### 1.2 DTOs

**`POST /availability/bulk` — Request:**
```typescript
// bulk-availability.dto.ts
import { z } from 'zod'

const timeRegex = /^([01]\d|2[0-3]):[0-5]\d$/

export const BulkAvailabilitySchema = z.object({
  dayOfWeek: z.number().int().min(0).max(6),
  startTime: z.string().regex(timeRegex, 'Formato invalido. Use HH:mm'),
  endTime: z.string().regex(timeRegex, 'Formato invalido. Use HH:mm'),
  slotDurationMinutes: z.number().int().min(15).max(240),
  breakStart: z.string().regex(timeRegex).optional(),
  breakEnd: z.string().regex(timeRegex).optional(),
}).refine(data => data.startTime < data.endTime, {
  message: 'Horario de termino deve ser apos o inicio',
  path: ['endTime'],
}).refine(data => {
  if (!data.breakStart && !data.breakEnd) return true
  if (data.breakStart && data.breakEnd) {
    return data.breakStart >= data.startTime &&
           data.breakEnd <= data.endTime &&
           data.breakStart < data.breakEnd
  }
  return false // um sem o outro e invalido
}, {
  message: 'Pausa invalida: informe inicio e fim dentro do horario de trabalho',
  path: ['breakStart'],
})

export class BulkAvailabilityDto implements z.infer<typeof BulkAvailabilitySchema> {
  @ApiProperty({ example: 1 }) dayOfWeek: number
  @ApiProperty({ example: '09:00' }) startTime: string
  @ApiProperty({ example: '18:00' }) endTime: string
  @ApiProperty({ example: 60 }) slotDurationMinutes: number
  @ApiProperty({ example: '12:00', required: false }) breakStart?: string
  @ApiProperty({ example: '13:00', required: false }) breakEnd?: string
}
```

**`POST /availability/copy` — Request:**
```typescript
export const CopyAvailabilitySchema = z.object({
  sourceDayOfWeek: z.number().int().min(0).max(6),
  targetDays: z.array(z.number().int().min(0).max(6)).min(1),
}).refine(data => !data.targetDays.includes(data.sourceDayOfWeek), {
  message: 'Dia de origem nao pode estar nos dias de destino',
  path: ['targetDays'],
})
```

**Response (ambos os endpoints):**
```typescript
export class BulkAvailabilityResponseDto {
  @ApiProperty() dayOfWeek: number
  @ApiProperty() slotsCreated: number
  @ApiProperty({ type: [AvailabilitySlotDto] }) slots: AvailabilitySlotDto[]
}

export class CopyAvailabilityResponseDto {
  @ApiProperty({ type: [Number] }) copiedToDays: number[]
  @ApiProperty() totalSlotsCreated: number
}
```

##### 1.3 Logica de geracao de slots (utilitario puro — facil de testar)

```typescript
// availability.utils.ts
export function generateSlots(
  startTime: string,
  endTime: string,
  durationMinutes: number,
  breakStart?: string,
  breakEnd?: string,
): Array<{ startTime: string; endTime: string }> {
  const slots: Array<{ startTime: string; endTime: string }> = []
  let current = timeToMinutes(startTime)
  const end = timeToMinutes(endTime)
  const bStart = breakStart ? timeToMinutes(breakStart) : null
  const bEnd = breakEnd ? timeToMinutes(breakEnd) : null

  while (current + durationMinutes <= end) {
    const slotEnd = current + durationMinutes

    // Pula slots que colidem com a pausa
    if (bStart !== null && bEnd !== null) {
      if (current < bEnd && slotEnd > bStart) {
        // slot colide com pausa — avanca para o fim da pausa
        current = bEnd
        continue
      }
    }

    slots.push({
      startTime: minutesToTime(current),
      endTime: minutesToTime(slotEnd),
    })
    current += durationMinutes
  }

  return slots
}

function timeToMinutes(time: string): number {
  const [h, m] = time.split(':').map(Number)
  return h * 60 + m
}

function minutesToTime(minutes: number): string {
  const h = Math.floor(minutes / 60).toString().padStart(2, '0')
  const m = (minutes % 60).toString().padStart(2, '0')
  return `${h}:${m}`
}
```

##### 1.4 Repository — novos metodos

```typescript
// Em AvailabilityRepository
async deleteByDay(personalId: string, dayOfWeek: number, tx?: DrizzleDb): Promise<void>
async createMany(slots: InsertAvailabilitySlot[], tx?: DrizzleDb): Promise<AvailabilitySlot[]>
async findByDay(personalId: string, dayOfWeek: number): Promise<AvailabilitySlot[]>
```

##### 1.5 Service — BulkAvailabilityService

```typescript
async execute(dto: BulkAvailabilityDto, personalId: string): Promise<BulkAvailabilityResponseDto> {
  // 1. Validar DTO com Zod
  const parsed = BulkAvailabilitySchema.safeParse(dto)
  if (!parsed.success) throw new BadRequestException(parsed.error.errors[0].message)

  // 2. Gerar lista de slots com utilitario
  const generated = generateSlots(
    dto.startTime, dto.endTime, dto.slotDurationMinutes,
    dto.breakStart, dto.breakEnd
  )
  if (generated.length === 0)
    throw new BadRequestException('Nenhum slot pode ser gerado com os parametros informados')

  // 3. Em transacao: deletar existentes + inserir novos
  const slots = await this.db.transaction(async (tx) => {
    await this.availabilityRepository.deleteByDay(personalId, dto.dayOfWeek, tx)
    return this.availabilityRepository.createMany(
      generated.map(s => ({ ...s, dayOfWeek: dto.dayOfWeek, personalId })),
      tx
    )
  })

  return { dayOfWeek: dto.dayOfWeek, slotsCreated: slots.length, slots }
}
```

##### 1.6 Service — CopyAvailabilityService

```typescript
async execute(dto: CopyAvailabilityDto, personalId: string): Promise<CopyAvailabilityResponseDto> {
  const parsed = CopyAvailabilitySchema.safeParse(dto)
  if (!parsed.success) throw new BadRequestException(parsed.error.errors[0].message)

  // 1. Buscar slots do dia origem
  const sourceSlots = await this.availabilityRepository.findByDay(personalId, dto.sourceDayOfWeek)
  if (sourceSlots.length === 0)
    throw new NotFoundException('Nenhum slot encontrado no dia de origem para copiar')

  // 2. Para cada dia destino: deletar existentes e inserir copias (em transacao unica)
  let totalCreated = 0
  await this.db.transaction(async (tx) => {
    for (const targetDay of dto.targetDays) {
      await this.availabilityRepository.deleteByDay(personalId, targetDay, tx)
      const copies = sourceSlots.map(s => ({
        startTime: s.startTime,
        endTime: s.endTime,
        dayOfWeek: targetDay,
        personalId,
      }))
      const created = await this.availabilityRepository.createMany(copies, tx)
      totalCreated += created.length
    }
  })

  return { copiedToDays: dto.targetDays, totalSlotsCreated: totalCreated }
}
```

##### 1.7 Estrutura de arquivos

```
src/modules/scheduling/availability/
  bulk/
    bulk-availability.controller.ts
    bulk-availability.service.ts
    dtos/
      request.dto.ts
      response.dto.ts
    tests/
      bulk-availability.service.spec.ts
      bulk-availability.controller.spec.ts
  copy/
    copy-availability.controller.ts
    copy-availability.service.ts
    dtos/
      request.dto.ts
      response.dto.ts
    tests/
      copy-availability.service.spec.ts
  shared/
    availability.utils.ts
    tests/
      availability.utils.spec.ts   ← testar generateSlots isoladamente
```

##### 1.8 Cenarios de erro — Backend

| Cenario | Excecao | Mensagem |
|---------|---------|----------|
| `endTime <= startTime` | `BadRequestException` | "Horario de termino deve ser apos o inicio" |
| `breakStart` sem `breakEnd` (ou vice-versa) | `BadRequestException` | "Informe inicio e fim da pausa" |
| Pausa fora do intervalo de trabalho | `BadRequestException` | "Pausa invalida: deve estar dentro do horario de trabalho" |
| `slotDurationMinutes` maior que o intervalo total | `BadRequestException` | "Nenhum slot pode ser gerado com os parametros informados" |
| `sourceDayOfWeek` sem slots para copiar | `NotFoundException` | "Nenhum slot encontrado no dia de origem para copiar" |
| `targetDays` contem o proprio dia de origem | `BadRequestException` | "Dia de origem nao pode estar nos dias de destino" |
| Falha de transacao no banco | Relanca erro original (NestJS captura como 500) | — |

---

#### 2. Frontend

##### 2.1 Service

```typescript
// services/availability.service.ts
export const bulkAvailability = (data: BulkAvailabilityPayload) =>
  api.post<BulkAvailabilityResponse>('/availability/bulk', data)

export const copyAvailability = (data: CopyAvailabilityPayload) =>
  api.post<CopyAvailabilityResponse>('/availability/copy', data)
```

##### 2.2 Hooks

```typescript
// hooks/use-bulk-availability.ts
export function useBulkAvailability() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: bulkAvailability,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['availability'] })
      toast.success(`${data.slotsCreated} slots criados com sucesso`)
    },
    onError: (err: AxiosError<ApiError>) => {
      toast.error(err.response?.data?.message ?? 'Erro ao configurar disponibilidade')
    },
  })
}

export function useCopyAvailability() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: copyAvailability,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['availability'] })
      toast.success(`${data.totalSlotsCreated} slots copiados para ${data.copiedToDays.length} dia(s)`)
    },
    onError: (err: AxiosError<ApiError>) => {
      toast.error(err.response?.data?.message ?? 'Erro ao copiar disponibilidade')
    },
  })
}
```

##### 2.3 Componente DisponibilidadeDiaForm

```
Campos (React Hook Form + Zod):
  - startTime: input text com mascara HH:mm
  - endTime: input text com mascara HH:mm
  - slotDurationMinutes: <Select> com opcoes [15, 30, 45, 60, 90, 120]
  - hasBreak: <Switch> — exibe/oculta campos de pausa
  - breakStart / breakEnd: inputs HH:mm (condicionais)

Preview (calculado em tempo real via useMemo):
  - Chama generateSlots() no frontend com os valores do form
  - Exibe lista de badges: "09:00-10:00", "10:00-11:00", ...
  - Exibe contador: "8 slots serao criados"
  - Se nenhum slot gerado: aviso amarelo "Sem slots com esses parametros"
  - Nao faz request ao backend — calculo local puro
```

**Validacao de schema no frontend (espelha o backend):**
```typescript
const schema = z.object({
  startTime: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/),
  endTime: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/),
  slotDurationMinutes: z.coerce.number().min(15).max(240),
  hasBreak: z.boolean(),
  breakStart: z.string().optional(),
  breakEnd: z.string().optional(),
}).refine(d => d.startTime < d.endTime, {
  message: 'Termino deve ser apos o inicio',
  path: ['endTime'],
})
// Adicionar refine de pausa igual ao backend
```

##### 2.4 Componente CopiarDisponibilidadeModal

```
Estado:
  - selectedDays: number[] (dias marcados)
  - Exibir todos os 7 dias exceto o dia de origem
  - "Selecionar todos" marca todos os outros dias
  - Aviso fixo: "Os slots existentes nos dias selecionados serao substituidos"

Submit:
  - Botao desabilitado se selectedDays.length === 0
  - Loading state no botao durante mutacao
  - Fechar modal automaticamente ao sucesso
```

##### 2.5 Cenarios de erro — Frontend

| Cenario | Comportamento |
|---------|---------------|
| Campos invalidos (schema) | Erro inline sob cada campo, botao desabilitado |
| `endTime <= startTime` | Erro inline em endTime antes mesmo de submeter |
| Preview sem slots | Badge amarelo "Sem slots — ajuste os parametros" |
| API retorna 400 | Toast de erro com mensagem da API |
| API retorna 404 (copy sem slots origem) | Toast "Nenhum slot configurado no dia de origem" |
| Erro de rede | Toast "Falha na conexao. Tente novamente" |
| Botao confirmar clicado 2x (double submit) | `isPending` desabilita o botao durante a mutacao |

---

#### 3. Testes — Backend (US-032)

```typescript
// availability.utils.spec.ts
describe('generateSlots', () => {
  it('gera slots corretos sem pausa', () => {
    const slots = generateSlots('09:00', '11:00', 60)
    expect(slots).toEqual([
      { startTime: '09:00', endTime: '10:00' },
      { startTime: '10:00', endTime: '11:00' },
    ])
  })

  it('pula slots que colidem com a pausa', () => {
    const slots = generateSlots('09:00', '14:00', 60, '12:00', '13:00')
    // Espera: 09-10, 10-11, 11-12, 13-14 (12-13 pulado)
    expect(slots).toHaveLength(4)
    expect(slots.find(s => s.startTime === '12:00')).toBeUndefined()
  })

  it('retorna array vazio quando duracao maior que intervalo', () => {
    expect(generateSlots('09:00', '09:30', 60)).toEqual([])
  })

  it('gera slots de 30 minutos corretamente', () => {
    const slots = generateSlots('08:00', '10:00', 30)
    expect(slots).toHaveLength(4)
  })
})

// bulk-availability.service.spec.ts
describe('BulkAvailabilityService', () => {
  describe('execute', () => {
    it('deleta slots existentes e insere os novos em transacao', async () => { ... })
    it('retorna 400 se endTime <= startTime', async () => { ... })
    it('retorna 400 se nenhum slot e gerado', async () => { ... })
    it('retorna 400 se breakStart sem breakEnd', async () => { ... })
    it('retorna 400 se pausa fora do horario de trabalho', async () => { ... })
  })
})

// copy-availability.service.spec.ts
describe('CopyAvailabilityService', () => {
  describe('execute', () => {
    it('copia slots do dia origem para os dias destino', async () => { ... })
    it('retorna 404 se dia origem nao tem slots', async () => { ... })
    it('retorna 400 se targetDays inclui o dia origem', async () => { ... })
    it('substitui slots existentes nos dias destino', async () => { ... })
  })
})
```

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
| `id` | varchar(36) PK | randomUUID() |
| `personal_id` | varchar(36) FK | tenant |
| `student_id` | varchar(36) FK | |
| `service_plan_id` | varchar(36) FK | |
| `days_of_week` | integer[] | dias da semana (0=dom .. 6=sab) |
| `start_time` | varchar(5) | HH:mm |
| `end_time` | varchar(5) | HH:mm |
| `series_start_date` | date | primeira data |
| `series_end_date` | date | ultima data (max startDate + 6 meses) |
| `notes` | text nullable | nota compartilhada por todas as sessoes |
| `created_at` | timestamp with time zone | DEFAULT now() |

#### Tabela `bookings` — alteracao
- Adicionar coluna `series_id` (varchar(36) FK nullable → `booking_series.id`, ON DELETE SET NULL)

---

### Criterios de Aceite

#### Criacao — Sessao Avulsa
- [ ] Personal cria booking com: aluno, plano de servico, data, horario, nota opcional
- [ ] Apenas alunos do proprio tenant aparecem no seletor
- [ ] Validacao de conflito de horario
- [ ] Sessao aparece no painel do aluno em "Proximas sessoes"

#### Criacao — Sessao Recorrente
- [ ] Toggle "Sessao unica / Recorrente" no formulario
- [ ] Campos recorrentes: dias da semana, horario inicio/fim, data inicio/fim (max 6 meses)
- [ ] Preview: "Serao criadas X sessoes entre [data] e [data]"
- [ ] Conflito em qualquer slot rejeita toda a operacao com lista de datas conflitantes
- [ ] Todas as sessoes aparecem na agenda e no painel do aluno

#### Exclusao — Sessao de Serie
- [ ] Dialog com 3 opcoes: somente esta / esta e as proximas / toda a serie
- [ ] Sessoes `completed` nunca sao afetadas por exclusoes em lote
- [ ] Cancela a `booking_series` quando nao restar nenhuma sessao nao-concluida

### Subtasks Backend
- [ ] Migration: tabela `booking_series` + coluna `series_id` em `bookings`
- [ ] `POST /bookings/personal` — sessao avulsa
- [ ] `POST /booking-series` — serie recorrente
- [ ] `DELETE /bookings/:id?scope=single|future|all`
- [ ] `GET /booking-series` — listar series ativas
- [ ] Atualizar `GET /bookings` com campos `seriesId` e `isRecurring`

### Subtasks Frontend
- [ ] Formulario com toggle sessao unica / recorrente
- [ ] Modo recorrente: checkboxes dias, date pickers, preview dinamico
- [ ] Dialog de exclusao com 3 opcoes de escopo
- [ ] Indicador visual de recorrencia na agenda

---

### Plano de Implementacao — US-024

#### 1. Backend

##### 1.1 Migration

```sql
-- Nova tabela
CREATE TABLE "booking_series" (
  "id" varchar(36) PRIMARY KEY DEFAULT gen_random_uuid(),
  "personal_id" varchar(36) NOT NULL REFERENCES "personals"("id"),
  "student_id" varchar(36) NOT NULL REFERENCES "students"("id"),
  "service_plan_id" varchar(36) NOT NULL REFERENCES "service_plans"("id"),
  "days_of_week" integer[] NOT NULL,
  "start_time" varchar(5) NOT NULL,
  "end_time" varchar(5) NOT NULL,
  "series_start_date" date NOT NULL,
  "series_end_date" date NOT NULL,
  "notes" text,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL
);
CREATE INDEX ON "booking_series" ("personal_id");

-- Alterar bookings
ALTER TABLE "bookings" ADD COLUMN "series_id" varchar(36) REFERENCES "booking_series"("id") ON DELETE SET NULL;
CREATE INDEX ON "bookings" ("series_id");
```

##### 1.2 Schema Drizzle

```typescript
// schema/booking-series.ts
export const bookingSeries = pgTable('booking_series', {
  id: varchar('id', { length: 36 }).primaryKey().$defaultFn(() => randomUUID()),
  personalId: varchar('personal_id', { length: 36 }).notNull().references(() => personals.id),
  studentId: varchar('student_id', { length: 36 }).notNull().references(() => students.id),
  servicePlanId: varchar('service_plan_id', { length: 36 }).notNull().references(() => servicePlans.id),
  daysOfWeek: integer('days_of_week').array().notNull(),
  startTime: varchar('start_time', { length: 5 }).notNull(),
  endTime: varchar('end_time', { length: 5 }).notNull(),
  seriesStartDate: date('series_start_date').notNull(),
  seriesEndDate: date('series_end_date').notNull(),
  notes: text('notes'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
})

// Adicionar no schema de bookings:
seriesId: varchar('series_id', { length: 36 }).references(() => bookingSeries.id),
```

##### 1.3 DTOs

**Sessao avulsa — `POST /bookings/personal`:**
```typescript
export const CreatePersonalBookingSchema = z.object({
  studentId: z.string().uuid(),
  servicePlanId: z.string().uuid(),
  scheduledAt: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),  // YYYY-MM-DD
  startTime: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/),
  notes: z.string().max(1000).optional(),
})
```

**Serie recorrente — `POST /booking-series`:**
```typescript
export const CreateBookingSeriesSchema = z.object({
  studentId: z.string().uuid(),
  servicePlanId: z.string().uuid(),
  daysOfWeek: z.array(z.number().int().min(0).max(6)).min(1).max(7),
  startTime: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/),
  endTime: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/),
  seriesStartDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  seriesEndDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  notes: z.string().max(1000).optional(),
}).refine(d => d.startTime < d.endTime, {
  message: 'Horario de termino deve ser apos o inicio',
  path: ['endTime'],
}).refine(d => d.seriesStartDate < d.seriesEndDate, {
  message: 'Data de termino deve ser apos a data de inicio',
  path: ['seriesEndDate'],
}).refine(d => {
  const start = new Date(d.seriesStartDate)
  const end = new Date(d.seriesEndDate)
  const maxEnd = new Date(start)
  maxEnd.setMonth(maxEnd.getMonth() + 6)
  return end <= maxEnd
}, {
  message: 'Periodo maximo da serie e de 6 meses',
  path: ['seriesEndDate'],
})
```

**Response da serie:**
```typescript
export class CreateBookingSeriesResponseDto {
  seriesId: string
  sessionsCreated: number
  sessions: { id: string; scheduledAt: string; startTime: string }[]
}
```

##### 1.4 Utilitario de geracao de datas da serie

```typescript
// booking-series.utils.ts
export function generateSeriesDates(
  daysOfWeek: number[],
  startDate: string,    // YYYY-MM-DD
  endDate: string,      // YYYY-MM-DD
): Date[] {
  const dates: Date[] = []
  const current = new Date(startDate + 'T00:00:00Z')
  const end = new Date(endDate + 'T00:00:00Z')

  while (current <= end) {
    if (daysOfWeek.includes(current.getUTCDay())) {
      dates.push(new Date(current))
    }
    current.setUTCDate(current.getUTCDate() + 1)
  }

  return dates
}
```

##### 1.5 Service — CreateBookingSeriesService

```typescript
async execute(dto: CreateBookingSeriesDto, personalId: string) {
  // 1. Validar schema Zod
  const parsed = CreateBookingSeriesSchema.safeParse(dto)
  if (!parsed.success) throw new BadRequestException(parsed.error.errors[0].message)

  // 2. Validar aluno pertence ao tenant
  const student = await this.studentsRepository.findById(dto.studentId, personalId)
  if (!student) throw new BadRequestException('Aluno nao encontrado ou nao pertence a este personal')

  // 3. Validar service plan pertence ao tenant
  const plan = await this.servicePlansRepository.findById(dto.servicePlanId, personalId)
  if (!plan) throw new BadRequestException('Plano de servico nao encontrado')

  // 4. Gerar todas as datas da serie
  const dates = generateSeriesDates(dto.daysOfWeek, dto.seriesStartDate, dto.seriesEndDate)
  if (dates.length === 0)
    throw new BadRequestException('Nenhuma sessao seria gerada com os dias e periodo informados')

  // 5. Checar conflitos em batch para todas as datas geradas
  const conflicts = await this.bookingsRepository.findConflicts(
    personalId,
    dates.map(d => ({ date: formatDate(d), startTime: dto.startTime }))
  )
  if (conflicts.length > 0) {
    throw new ConflictException({
      message: 'Conflito de horario nas seguintes datas',
      conflictingDates: conflicts.map(c => c.scheduledDate),
    })
  }

  // 6. Inserir serie + bookings em transacao
  return this.db.transaction(async (tx) => {
    const series = await this.bookingSeriesRepository.create({
      personalId, studentId: dto.studentId, servicePlanId: dto.servicePlanId,
      daysOfWeek: dto.daysOfWeek, startTime: dto.startTime, endTime: dto.endTime,
      seriesStartDate: dto.seriesStartDate, seriesEndDate: dto.seriesEndDate,
      notes: dto.notes,
    }, tx)

    const bookingsData = dates.map(date => ({
      personalId, studentId: dto.studentId, servicePlanId: dto.servicePlanId,
      scheduledDate: date, startTime: dto.startTime, endTime: dto.endTime,
      status: 'scheduled' as const, seriesId: series.id, notes: dto.notes,
    }))

    const created = await this.bookingsRepository.createMany(bookingsData, tx)
    return { seriesId: series.id, sessionsCreated: created.length, sessions: created }
  })
}
```

##### 1.6 Service — DeleteBookingService (escopo)

```typescript
async execute(bookingId: string, personalId: string, scope: 'single' | 'future' | 'all') {
  // 1. Buscar booking e validar ownership
  const booking = await this.bookingsRepository.findById(bookingId)
  if (!booking || booking.personalId !== personalId)
    throw new NotFoundException('Agendamento nao encontrado')

  // 2. Nao permitir excluir sessao ja concluida
  if (booking.status === 'completed')
    throw new BadRequestException('Nao e possivel excluir uma sessao ja concluida')

  // 3. Se nao tem serie, ignora scope (trata como single)
  if (!booking.seriesId || scope === 'single') {
    await this.bookingsRepository.deleteById(bookingId)
    return
  }

  // 4. Escopo future: excluir este e proximos nao-concluidos da serie
  if (scope === 'future') {
    await this.bookingsRepository.deleteBySeriesFromDate(
      booking.seriesId,
      booking.scheduledDate,
      personalId,
    )
    // Verificar se ainda ha sessoes nao-concluidas na serie
    await this.cleanupSeriesIfEmpty(booking.seriesId, personalId)
    return
  }

  // 5. Escopo all: excluir todos nao-concluidos + a propria serie
  if (scope === 'all') {
    await this.db.transaction(async (tx) => {
      await this.bookingsRepository.deleteBySeriesExcludeCompleted(booking.seriesId!, personalId, tx)
      await this.bookingSeriesRepository.deleteById(booking.seriesId!, tx)
    })
  }
}

private async cleanupSeriesIfEmpty(seriesId: string, personalId: string) {
  const remaining = await this.bookingsRepository.countPendingBySeries(seriesId, personalId)
  if (remaining === 0) {
    await this.bookingSeriesRepository.deleteById(seriesId)
  }
}
```

##### 1.7 Novos metodos de Repository

```typescript
// BookingsRepository
findConflicts(personalId: string, slots: { date: string; startTime: string }[]): Promise<Booking[]>
createMany(data: InsertBooking[], tx?: DrizzleDb): Promise<Booking[]>
deleteBySeriesFromDate(seriesId: string, fromDate: Date, personalId: string): Promise<void>
deleteBySeriesExcludeCompleted(seriesId: string, personalId: string, tx?: DrizzleDb): Promise<void>
countPendingBySeries(seriesId: string, personalId: string): Promise<number>

// BookingSeriesRepository (novo)
create(data: InsertBookingSeries, tx?: DrizzleDb): Promise<BookingSeries>
findById(id: string, personalId: string): Promise<BookingSeries | null>
findAllByPersonal(personalId: string): Promise<BookingSeriesWithSummary[]>
deleteById(id: string, tx?: DrizzleDb): Promise<void>
```

##### 1.8 Cenarios de erro — Backend

| Cenario | Excecao | Mensagem |
|---------|---------|----------|
| Aluno nao pertence ao tenant | `BadRequestException` | "Aluno nao encontrado ou nao pertence a este personal" |
| Plano de servico nao pertence ao tenant | `BadRequestException` | "Plano de servico nao encontrado" |
| Conflito de horario (avulso) | `ConflictException` | "Ja existe um agendamento neste horario" |
| Conflito em 1+ datas da serie | `ConflictException` | `{ message, conflictingDates: string[] }` |
| `daysOfWeek` vazio | `BadRequestException` (Zod) | "Selecione ao menos um dia da semana" |
| Serie geraria 0 sessoes | `BadRequestException` | "Nenhuma sessao seria gerada com os dias e periodo informados" |
| `seriesEndDate` > 6 meses | `BadRequestException` (Zod) | "Periodo maximo da serie e de 6 meses" |
| Excluir sessao `completed` | `BadRequestException` | "Nao e possivel excluir uma sessao ja concluida" |
| `scope` invalido | `BadRequestException` | "Scope invalido. Use: single, future ou all" |
| `scope` obrigatorio com `seriesId` | `BadRequestException` | "Informe o scope para excluir sessao de uma serie" |
| Booking nao encontrado / outro tenant | `NotFoundException` | "Agendamento nao encontrado" |

---

#### 2. Frontend

##### 2.1 Services

```typescript
// services/bookings.service.ts
export const createPersonalBooking = (data: CreatePersonalBookingPayload) =>
  api.post<BookingDto>('/bookings/personal', data)

export const deleteBooking = (id: string, scope?: 'single' | 'future' | 'all') =>
  api.delete(`/bookings/${id}`, { params: { scope } })

// services/booking-series.service.ts
export const createBookingSeries = (data: CreateBookingSeriesPayload) =>
  api.post<CreateBookingSeriesResponse>('/booking-series', data)

export const listBookingSeries = () =>
  api.get<BookingSeriesSummary[]>('/booking-series')
```

##### 2.2 Hooks

```typescript
export function useCreatePersonalBooking(onSuccess?: () => void) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: createPersonalBooking,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookings'] })
      toast.success('Sessao criada com sucesso')
      onSuccess?.()
    },
    onError: (err: AxiosError<ApiError>) => {
      toast.error(err.response?.data?.message ?? 'Erro ao criar sessao')
    },
  })
}

export function useCreateBookingSeries(onSuccess?: () => void) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: createBookingSeries,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['bookings'] })
      queryClient.invalidateQueries({ queryKey: ['booking-series'] })
      toast.success(`${data.sessionsCreated} sessoes criadas com sucesso`)
      onSuccess?.()
    },
    onError: (err: AxiosError<ApiError>) => {
      const apiError = err.response?.data
      // Tratar conflito com lista de datas
      if (err.response?.status === 409 && apiError?.details) {
        const dates = apiError.details.map(d => d.message).join(', ')
        toast.error(`Conflito de horario nas datas: ${dates}`)
      } else {
        toast.error(apiError?.message ?? 'Erro ao criar recorrencia')
      }
    },
  })
}

export function useDeleteBooking() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, scope }: { id: string; scope?: string }) => deleteBooking(id, scope as any),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookings'] })
      queryClient.invalidateQueries({ queryKey: ['booking-series'] })
      toast.success('Sessao removida')
    },
    onError: (err: AxiosError<ApiError>) => {
      toast.error(err.response?.data?.message ?? 'Erro ao remover sessao')
    },
  })
}
```

##### 2.3 Formulario AdicionarSessaoDialog

```
Estado interno:
  - mode: 'single' | 'recurring'  (toggle no topo do form)

Campos comuns (ambos os modos):
  - studentId: Combobox com busca (dados de GET /students)
  - servicePlanId: Select (dados de GET /service-plans)
  - notes: Textarea opcional

Campos — modo 'single':
  - scheduledAt: DatePicker (data unica)
  - startTime: Input HH:mm

Campos — modo 'recurring':
  - daysOfWeek: grupo de 7 ToggleButtons (Seg/Ter/Qua/Qui/Sex/Sab/Dom)
  - startTime + endTime: Inputs HH:mm
  - seriesStartDate + seriesEndDate: DatePickers
  - Preview calculado no frontend via useMemo:
      const count = generateSeriesDates(daysOfWeek, start, end).length
      → Exibe: "Serao criadas 24 sessoes entre 10/03 e 10/09"
      → Se count === 0: aviso "Nenhuma sessao com esses dias e periodo"
      → Se endDate > startDate + 6 meses: aviso vermelho abaixo de endDate

Fluxo de submit:
  1. RHF valida schema localmente
  2. Se valido, chama mutate()
  3. isPending desabilita botao (evita double submit)
  4. onSuccess fecha dialog + invalida queries
  5. onError exibe toast com mensagem da API
```

##### 2.4 DeleteBookingDialog — para sessoes de serie

```
Condicao de exibicao:
  - Se booking.isRecurring === true: exibe dialogo com 3 opcoes
  - Se booking.isRecurring === false: confirma exclusao simples (sem opcoes de scope)

Opcoes (RadioGroup):
  1. "Somente esta sessao" (value: 'single') — selecionada por padrao
  2. "Esta e as proximas" (value: 'future') — com descricao "Remove esta sessao e todas as futuras desta serie"
  3. "Toda a serie" (value: 'all') — com descricao "Remove todas as sessoes desta serie (exceto as ja concluidas)"

Botao confirmar:
  - Texto dinamico por opcao: "Remover sessao" / "Remover esta e proximas" / "Remover toda a serie"
  - Variante destructive (vermelho)
  - isPending desabilita durante mutacao
```

##### 2.5 Indicador visual de recorrencia

```
Na lista/calendario da agenda:
  - Sessoes com isRecurring === true exibem um icone <Repeat2 /> (Lucide) ao lado
  - Tooltip no hover: "Sessao recorrente"
  - Nenhuma outra diferenca visual — nao poluir a agenda
```

##### 2.6 Cenarios de erro — Frontend

| Cenario | Comportamento |
|---------|---------------|
| Nenhum dia selecionado (recorrente) | Campo de dias com borda vermelha + "Selecione ao menos 1 dia" |
| Preview com 0 sessoes | Aviso amarelo, botao submit desabilitado |
| Data fim > 6 meses | Aviso vermelho sob `seriesEndDate`, submit bloqueado pelo schema |
| API retorna 409 com `conflictingDates` | Toast com lista de datas: "Conflito nas datas: 15/03, 22/03..." |
| API retorna 400 (aluno invalido) | Toast com mensagem da API |
| Rede indisponivel | Toast "Falha na conexao. Tente novamente" |
| Double submit | isPending desabilita botao automaticamente |

---

#### 3. Testes — Backend (US-024)

```typescript
// booking-series.utils.spec.ts
describe('generateSeriesDates', () => {
  it('gera datas apenas nos dias corretos da semana', () => {
    // segunda=1, quarta=3 entre 10/03 e 20/03
    const dates = generateSeriesDates([1, 3], '2026-03-10', '2026-03-20')
    expect(dates.map(d => d.toISOString().slice(0, 10)))
      .toEqual(['2026-03-11', '2026-03-13', '2026-03-18', '2026-03-20'])
  })

  it('retorna array vazio quando nenhum dia coincide', () => {
    // sabado=6 mas o periodo so tem dias uteis
    const dates = generateSeriesDates([6], '2026-03-10', '2026-03-13')
    expect(dates).toHaveLength(1)  // sabado 14 esta fora do periodo
  })
})

// create-booking-series.service.spec.ts
describe('CreateBookingSeriesService', () => {
  it('cria serie e todos os bookings em transacao', async () => { ... })
  it('retorna 400 se aluno nao pertence ao tenant', async () => { ... })
  it('retorna 400 se nenhuma sessao seria gerada', async () => { ... })
  it('retorna 409 com lista de datas conflitantes', async () => { ... })
  it('retorna 400 se periodo maior que 6 meses', async () => { ... })
  it('rollback transacao se insercao de bookings falhar', async () => { ... })
})

// delete-booking.service.spec.ts
describe('DeleteBookingService', () => {
  describe('scope: single', () => {
    it('deleta apenas o booking informado', async () => { ... })
    it('nao afeta outros bookings da mesma serie', async () => { ... })
  })
  describe('scope: future', () => {
    it('deleta o booking e todos os proximos da serie', async () => { ... })
    it('nao deleta sessoes ja concluidas', async () => { ... })
    it('deleta a booking_series se nao restar sessoes pendentes', async () => { ... })
  })
  describe('scope: all', () => {
    it('deleta todos os bookings nao-concluidos da serie', async () => { ... })
    it('deleta o registro booking_series', async () => { ... })
    it('preserva sessoes com status completed', async () => { ... })
  })
  it('retorna 404 para booking de outro tenant', async () => { ... })
  it('retorna 400 ao tentar excluir sessao completed', async () => { ... })
})
```

---

## US-025 — Notas de sessao e historico rapido

**Status:** `[ ]` todo
**Sprint:** 8
**Dependencias:** US-024

**Descricao:**
Como personal, quero registrar notas curtas por sessao para acompanhar evolucao do atendimento sem abrir tela complexa.

### Criterios de Aceite
- [ ] Personal pode editar nota de uma sessao agendada ou concluida
- [ ] Nota visivel no detalhe do agendamento e no historico do aluno
- [ ] Limite de 1000 caracteres com contador e validacao no backend e frontend
- [ ] Nota nao visivel para o aluno (privada ao personal)

### Subtasks Backend
- [ ] `PATCH /bookings/:id/notes` — `{ notes: string }`
- [ ] Validar ownership do booking pelo personal
- [ ] Validar limite de 1000 caracteres no DTO
- [ ] Unit tests: happy path, nota muito longa, booking de outro tenant, booking de outro status

### Subtasks Frontend
- [ ] Campo de notas no dialog de detalhe da sessao
- [ ] Contador de caracteres em tempo real
- [ ] Secao de historico no detalhe do aluno
- [ ] Estados de loading/saving

---

### Plano de Implementacao — US-025

#### 1. Backend

##### 1.1 Estrutura

Novo context dentro do modulo `bookings`:

```
src/modules/bookings/
  update-notes/
    update-notes.controller.ts
    update-notes.service.ts
    dtos/
      request.dto.ts
    tests/
      update-notes.service.spec.ts
      update-notes.controller.spec.ts
```

**Sem migration** — a coluna `notes` ja existe em `bookings` (verificar; se nao existir, adicionar via migration: `ALTER TABLE bookings ADD COLUMN notes text`).

##### 1.2 DTO

```typescript
export const UpdateBookingNotesSchema = z.object({
  notes: z.string().max(1000, 'Nota deve ter no maximo 1000 caracteres').nullable(),
})
// notes: null → limpa a nota; string → atualiza
```

##### 1.3 Service

```typescript
async execute(bookingId: string, dto: UpdateBookingNotesDto, personalId: string) {
  const parsed = UpdateBookingNotesSchema.safeParse(dto)
  if (!parsed.success) throw new BadRequestException(parsed.error.errors[0].message)

  // 1. Buscar booking e validar ownership
  const booking = await this.bookingsRepository.findById(bookingId)
  if (!booking || booking.personalId !== personalId)
    throw new NotFoundException('Agendamento nao encontrado')

  // 2. Nao permitir editar nota de sessao cancelada
  if (booking.status === 'cancelled')
    throw new BadRequestException('Nao e possivel editar nota de sessao cancelada')

  // 3. Atualizar
  return this.bookingsRepository.updateNotes(bookingId, dto.notes)
}
```

##### 1.4 Repository — novo metodo

```typescript
async updateNotes(bookingId: string, notes: string | null): Promise<Booking>
```

##### 1.5 Historico de notas — GET /students/:id/booking-history

Endpoint que retorna sessoes passadas com notas do aluno para exibir no detalhe do aluno:

```typescript
// Adicionar ao StudentsModule context
// GET /students/:id/booking-history?page=1&size=10
// Retorna bookings com status completed|no-show do aluno, incluindo campo notes
// Tenant-aware: personalId do JWT
```

##### 1.6 Cenarios de erro

| Cenario | Excecao | Mensagem |
|---------|---------|----------|
| Nota > 1000 chars | `BadRequestException` | "Nota deve ter no maximo 1000 caracteres" |
| Booking nao pertence ao tenant | `NotFoundException` | "Agendamento nao encontrado" |
| Booking com status `cancelled` | `BadRequestException` | "Nao e possivel editar nota de sessao cancelada" |

---

#### 2. Frontend

##### 2.1 Componente NotasSessaoField

```
Local: dentro do BookingDetailDialog (ja existente ou a criar)

Campo:
  - <Textarea> com placeholder "Adicione uma nota sobre esta sessao..."
  - maxLength={1000} (previne digitacao alem do limite no browser)
  - Contador: `{notes.length}/1000` — fica vermelho acima de 900

Estado de save:
  - Debounce de 800ms apos parar de digitar → dispara PATCH automaticamente (auto-save)
  - OU botao "Salvar nota" explicito — escolher a abordagem mais simples
  - Recomendacao: botao explicito evita requests desnecessarios

Indicador de save:
  - Durante mutacao: spinner pequeno ao lado do botao
  - Apos sucesso: checkmark verde por 2 segundos
  - Erro: mensagem inline vermelha (nao toast — nao interromper o fluxo)

Restricao de visibilidade:
  - Campo visivel APENAS na area do personal (/painel/*)
  - Nao renderizar o campo na area do aluno (/{slug}/alunos/*)
  - Na area do aluno, o campo notes simplesmente nao aparece no response
    (o backend pode omitir ou retornar null — preferir omitir via DTO de response do aluno)
```

##### 2.2 Secao de Historico no Detalhe do Aluno

```
Local: /painel/alunos/:id — nova aba ou secao "Historico de sessoes"

Dados: GET /students/:id/booking-history?page=1&size=10

Card por sessao:
  - Data + horario
  - Status badge (concluida / no-show)
  - Nota (se existir) — texto em itálico, sem opcao de editar aqui (edita pelo detalhe da sessao)
  - Paginacao simples (anterior / proxima)

Estado vazio: "Nenhuma sessao concluida ainda"
```

##### 2.3 Cenarios de erro — Frontend

| Cenario | Comportamento |
|---------|---------------|
| Nota com mais de 1000 chars (via paste) | Campo bloqueia em 1000, contador vermelho, botao desabilitado |
| API retorna 400 | Mensagem inline vermelha sob o campo |
| Booking cancelado (edge case) | Toast de erro com mensagem da API |
| Erro de rede ao salvar | Mensagem inline + botao "Tentar novamente" |

---

#### 3. Testes — Backend (US-025)

```typescript
describe('UpdateBookingNotesService', () => {
  it('atualiza nota com sucesso', async () => { ... })
  it('limpa nota quando notes = null', async () => { ... })
  it('retorna 400 se nota exceder 1000 chars', async () => { ... })
  it('retorna 404 para booking de outro tenant', async () => { ... })
  it('retorna 400 para booking cancelado', async () => { ... })
})
```

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
- [ ] Resultados respeitam tenant isolation

### Subtasks Backend
- [ ] `GET /search/global?q=...` (tenant-aware via JWT)
- [ ] Query federada: students + workout_plans + bookings (max 5 por tipo)
- [ ] Unit tests com mocks de repository por tipo

### Subtasks Frontend
- [ ] Command palette com shadcn `<Command />`
- [ ] Integracao com debounce de 300ms
- [ ] Keyboard navigation + acessibilidade

---

### Plano de Implementacao — US-026

#### 1. Backend

##### 1.1 Estrutura de modulo

```
src/modules/search/
  search.module.ts
  global-search/
    global-search.controller.ts
    global-search.service.ts
    dtos/
      response.dto.ts
    tests/
      global-search.service.spec.ts
```

##### 1.2 DTO de Response

```typescript
export class SearchResultItemDto {
  id: string
  label: string        // nome do aluno / titulo do treino / "Sessao com [aluno] em [data]"
  description: string  // subtitulo contextual
  type: 'student' | 'workout' | 'booking'
  url: string          // rota de navegacao no frontend
}

export class GlobalSearchResponseDto {
  students: SearchResultItemDto[]
  workouts: SearchResultItemDto[]
  bookings: SearchResultItemDto[]
  total: number
}
```

##### 1.3 Service

```typescript
async execute(query: string, personalId: string): Promise<GlobalSearchResponseDto> {
  if (!query || query.trim().length < 2) return { students: [], workouts: [], bookings: [], total: 0 }

  const q = query.trim()

  const [students, workouts, bookings] = await Promise.all([
    this.studentsRepository.search(personalId, q, 5),
    this.workoutPlansRepository.search(personalId, q, 5),
    this.bookingsRepository.search(personalId, q, 5),
  ])

  return {
    students: students.map(s => ({
      id: s.id, label: s.name, description: s.email,
      type: 'student', url: `/painel/alunos/${s.id}`,
    })),
    workouts: workouts.map(w => ({
      id: w.id, label: w.name, description: w.description ?? 'Plano de treino',
      type: 'workout', url: `/painel/treinos/${w.id}`,
    })),
    bookings: bookings.map(b => ({
      id: b.id,
      label: `Sessao com ${b.studentName}`,
      description: `${formatDate(b.scheduledDate)} as ${b.startTime} — ${b.status}`,
      type: 'booking', url: `/painel/agenda`,
    })),
    total: students.length + workouts.length + bookings.length,
  }
}
```

##### 1.4 Repository — novos metodos de busca

```typescript
// Usar ILIKE (case-insensitive) no Drizzle:
// sql`${students.name} ILIKE ${'%' + query + '%'}`

// StudentsRepository
search(personalId: string, query: string, limit: number): Promise<{ id, name, email }[]>

// WorkoutPlansRepository
search(personalId: string, query: string, limit: number): Promise<{ id, name, description }[]>

// BookingsRepository
search(personalId: string, query: string, limit: number): Promise<BookingWithStudentName[]>
// join com students para buscar pelo nome do aluno
```

##### 1.5 Cenarios de erro

| Cenario | Comportamento |
|---------|---------------|
| Query vazia ou < 2 chars | Retorna objeto vazio (sem request ao banco) |
| Query com caracteres especiais (SQL injection) | ILIKE com parametro bindado — Drizzle protege automaticamente |
| Nenhum resultado | Retorna arrays vazios, total: 0 — nao e erro |
| Tenant sem dados ainda | Retorna arrays vazios — nao e erro |

---

#### 2. Frontend

##### 2.1 Hook

```typescript
export function useGlobalSearch(query: string) {
  return useQuery({
    queryKey: ['search', query],
    queryFn: () => searchGlobal(query),
    enabled: query.trim().length >= 2,
    staleTime: 30_000,   // cache de 30s para buscas recentes
    placeholderData: keepPreviousData,  // evita flash de vazio entre queries
  })
}
```

##### 2.2 Componente GlobalSearch (Command Palette)

```
Abertura:
  - Botao no header com icone de lupa + shortcut hint "⌘K"
  - Listener de teclado no layout: Ctrl/Cmd + K → abre dialog
  - useEffect no layout do painel:
      useEffect(() => {
        const handler = (e: KeyboardEvent) => {
          if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
            e.preventDefault()
            setOpen(true)
          }
        }
        document.addEventListener('keydown', handler)
        return () => document.removeEventListener('keydown', handler)
      }, [])

Estrutura do componente:
  <CommandDialog open={open} onOpenChange={setOpen}>
    <CommandInput
      placeholder="Buscar alunos, treinos, sessoes..."
      value={query}
      onValueChange={setQuery}   // debounce 300ms via useDeferredValue ou lodash
    />
    <CommandList>
      <CommandEmpty>Nenhum resultado encontrado</CommandEmpty>

      {/* Skeleton enquanto carrega */}
      {isLoading && <CommandLoading>Buscando...</CommandLoading>}

      {data?.students.length > 0 && (
        <CommandGroup heading="Alunos">
          {data.students.map(item => (
            <CommandItem key={item.id} onSelect={() => navigate(item.url)}>
              <UserIcon /> {item.label}
              <span>{item.description}</span>
            </CommandItem>
          ))}
        </CommandGroup>
      )}
      {/* idem para workouts e bookings */}
    </CommandList>
  </CommandDialog>

Navegacao:
  - onSelect: router.push(item.url) + setOpen(false)
  - Tecla Escape fecha o dialog (comportamento padrao do CommandDialog)
  - Setas up/down navegam entre itens (comportamento padrao shadcn)
```

##### 2.3 Cenarios de erro — Frontend

| Cenario | Comportamento |
|---------|---------------|
| Query < 2 chars | CommandEmpty: "Digite ao menos 2 caracteres" |
| Carregando resultados | CommandLoading com texto "Buscando..." |
| API retorna erro | CommandEmpty: "Erro ao buscar. Tente novamente" |
| Nenhum resultado | CommandEmpty: "Nenhum resultado para '[query]'" |
| Rede offline | useQuery entra em estado de erro — exibir mensagem generica |

---

#### 3. Testes — Backend (US-026)

```typescript
describe('GlobalSearchService', () => {
  it('retorna resultados agrupados por tipo', async () => { ... })
  it('retorna objeto vazio para query com menos de 2 chars', async () => { ... })
  it('limita a 5 resultados por tipo', async () => { ... })
  it('busca e tenant-aware (nao retorna dados de outro personal)', async () => { ... })
  it('retorna total correto somando os 3 tipos', async () => { ... })
})
```

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
- [ ] `GET /dashboard/personal/stats?period=7d|30d`
- [ ] Repository dedicado `PersonalDashboardRepository`
- [ ] Unit tests de calculo

### Subtasks Frontend
- [ ] Cards de metricas com filtro de periodo
- [ ] Skeleton loaders e estado vazio por card
- [ ] Grid responsivo

---

### Plano de Implementacao — US-027

#### 1. Backend

##### 1.1 Estrutura

```
src/modules/dashboard/
  dashboard.module.ts
  personal-stats/
    personal-stats.controller.ts
    personal-stats.service.ts
    dtos/
      response.dto.ts
    tests/
      personal-stats.service.spec.ts
  repositories/
    personal-dashboard.repository.ts
    tests/
      personal-dashboard.repository.spec.ts
```

##### 1.2 DTO de Response

```typescript
export class PersonalStatsResponseDto {
  period: '7d' | '30d'
  sessionsThisWeek: number          // agendadas a partir de hoje ate fim da semana
  sessionsCompleted: number         // completed no periodo
  sessionsNoShow: number            // no-show no periodo
  activeStudents: number            // alunos com >= 1 booking no periodo
  activeWorkoutPlans: number        // planos atribuidos a pelo menos 1 aluno ativo
  periodLabel: string               // "Ultimos 7 dias" | "Ultimos 30 dias"
}
```

##### 1.3 Repository — PersonalDashboardRepository

```typescript
// Cada metodo executa 1 query otimizada

async countSessionsThisWeek(personalId: string): Promise<number>
// WHERE personalId = :id AND scheduledDate BETWEEN :startOfWeek AND :endOfWeek AND status = 'scheduled'

async countSessionsByStatus(
  personalId: string,
  status: 'completed' | 'no-show',
  since: Date,
): Promise<number>
// WHERE personalId = :id AND status = :status AND scheduledDate >= :since

async countActiveStudents(personalId: string, since: Date): Promise<number>
// SELECT COUNT(DISTINCT studentId) FROM bookings
// WHERE personalId = :id AND scheduledDate >= :since AND status != 'cancelled'

async countActiveWorkoutPlans(personalId: string): Promise<number>
// SELECT COUNT(DISTINCT workoutPlanId) FROM workout_plan_students wps
// JOIN students s ON wps.studentId = s.id
// WHERE s.personalId = :id AND s.isActive = true
```

##### 1.4 Service

```typescript
async execute(personalId: string, period: '7d' | '30d'): Promise<PersonalStatsResponseDto> {
  const days = period === '7d' ? 7 : 30
  const since = new Date()
  since.setDate(since.getDate() - days)

  const [
    sessionsThisWeek,
    sessionsCompleted,
    sessionsNoShow,
    activeStudents,
    activeWorkoutPlans,
  ] = await Promise.all([
    this.repo.countSessionsThisWeek(personalId),
    this.repo.countSessionsByStatus(personalId, 'completed', since),
    this.repo.countSessionsByStatus(personalId, 'no-show', since),
    this.repo.countActiveStudents(personalId, since),
    this.repo.countActiveWorkoutPlans(personalId),
  ])

  return {
    period,
    sessionsThisWeek,
    sessionsCompleted,
    sessionsNoShow,
    activeStudents,
    activeWorkoutPlans,
    periodLabel: period === '7d' ? 'Ultimos 7 dias' : 'Ultimos 30 dias',
  }
}
```

##### 1.5 Cenarios de erro

| Cenario | Comportamento |
|---------|---------------|
| `period` invalido (ex: `15d`) | `BadRequestException` "Period invalido. Use: 7d ou 30d" |
| Personal sem dados ainda | Retorna todos os valores como `0` — nao e erro |
| Erro de query no banco | Relanca (NestJS retorna 500) |

---

#### 2. Frontend

##### 2.1 Hook

```typescript
export function usePersonalStats(period: '7d' | '30d') {
  return useQuery({
    queryKey: ['personal-stats', period],
    queryFn: () => getPersonalStats(period),
    staleTime: 5 * 60_000,  // 5 minutos — dado nao precisa ser real-time
  })
}
```

##### 2.2 Layout da pagina `/painel`

```
Header:
  - Titulo "Visao Geral"
  - SegmentedControl ou Tabs: "7 dias" | "30 dias" (estado local, nao URL)

Grid de cards (4 cards):
  - Layout: 1 col (mobile) → 2 cols (sm) → 4 cols (lg)

Card 1 — Sessoes da semana
  - Numero grande
  - Subtitulo: "agendadas esta semana"
  - Icone: <Calendar />

Card 2 — Sessoes concluidas
  - Numero grande (sessionsCompleted)
  - Subtitulo: "concluidas nos ultimos X dias"
  - Badge secundario: `sessionsNoShow no-show` (vermelho suave)
  - Icone: <CheckCircle />

Card 3 — Alunos ativos
  - Numero grande
  - Subtitulo: "com sessao nos ultimos X dias"
  - Icone: <Users />

Card 4 — Treinos atribuidos
  - Numero grande
  - Subtitulo: "planos de treino ativos"
  - Icone: <Dumbbell />

Estado de loading:
  - Skeleton de numero + subtitulo em cada card
  - Skeleton nao pisca (usa CSS animation, nao flash branco)

Estado vazio (todos zerados):
  - Nenhuma mensagem especial — zeros sao validos para contas novas
```

##### 2.3 Cenarios de erro — Frontend

| Cenario | Comportamento |
|---------|---------------|
| API fora do ar | Cada card exibe "—" no lugar do numero + icone de aviso no hover |
| Dados zerados (conta nova) | Exibe "0" normalmente — nao e estado de erro |
| Troca de periodo | Skeleton enquanto nova query carrega (placeholderData do query anterior) |

---

#### 3. Testes — Backend (US-027)

```typescript
describe('PersonalStatsService', () => {
  it('retorna todas as metricas corretamente para periodo 7d', async () => { ... })
  it('retorna todas as metricas corretamente para periodo 30d', async () => { ... })
  it('retorna zeros quando personal nao tem dados', async () => { ... })
  it('retorna 400 para period invalido', async () => { ... })
  it('executa todas as queries em paralelo (Promise.all)', async () => {
    // Verificar que os 5 metodos do repository foram chamados
    expect(mockRepo.countSessionsThisWeek).toHaveBeenCalledTimes(1)
    // ...
  })
})
```
