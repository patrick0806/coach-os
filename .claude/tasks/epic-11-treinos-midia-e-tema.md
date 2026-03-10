# Epic 11 — Treinos, Midia e Tema

Status: `[~]` in progress

---

## US-028 — Separar fichas em modelo (generica) e especifica por aluno

**Status:** `[x]` done
**Sprint:** 10
**Dependencias:** US-008, US-009

**Descricao:**
Como personal, quero organizar minhas fichas em modelos reutilizaveis e fichas especificas por aluno para reduzir poluicao na listagem e facilitar a manutencao de treinos padronizados.

### Criterios de Aceite
- [x] Workout plan possui tipo `planKind`: `template` ou `student`
- [x] Ao criar plano, personal escolhe o tipo (padrao: `template`)
- [x] Lista separada em abas: "Modelos" e "Por aluno"
- [x] "Aplicar para aluno" cria copia editavel independente do modelo
- [x] Aba "Por aluno" tem filtro por nome do aluno

### Subtasks Backend
- [x] Migration: `plan_kind` e `source_template_id` em `workout_plans`
- [x] Ajustar `GET /workout-plans?kind=`
- [x] `POST /workout-plans/:id/apply`
- [x] Unit tests

### Subtasks Frontend
- [x] Refatorar `/painel/treinos` com Tabs
- [x] Botao "Aplicar para aluno" com dialog
- [x] Filtro por aluno na aba "Por aluno"

---

### Plano de Implementacao — US-029

#### 1. Backend

##### 1.1 Migration

```sql
ALTER TABLE "workout_plans"
  ADD COLUMN "plan_kind" varchar(10) NOT NULL DEFAULT 'template',
  ADD COLUMN "source_template_id" varchar(36) REFERENCES "workout_plans"("id") ON DELETE SET NULL;

-- Planos ja existentes na base recebem plan_kind = 'template' pelo DEFAULT
CREATE INDEX ON "workout_plans" ("personal_id", "plan_kind");
```

##### 1.2 Schema Drizzle

```typescript
// Adicionar em schema/workout-plans.ts
planKind: varchar('plan_kind', { length: 10 })
  .$type<'template' | 'student'>()
  .notNull()
  .default('template'),
sourceTemplateId: varchar('source_template_id', { length: 36 })
  .references((): AnyPgColumn => workoutPlans.id),  // self-reference
```

##### 1.3 Ajuste no GET /workout-plans

```typescript
// request.dto.ts — adicionar query param
export const ListWorkoutPlansSchema = z.object({
  kind: z.enum(['template', 'student']).optional(),
  page: z.coerce.number().int().min(1).default(1),
  size: z.coerce.number().int().min(1).max(100).default(10),
  search: z.string().optional(),
})

// repository — adicionar filtro por kind
async findAll(personalId: string, filters: { kind?, search?, page, size }) {
  const conditions = [eq(workoutPlans.personalId, personalId)]
  if (filters.kind) conditions.push(eq(workoutPlans.planKind, filters.kind))
  if (filters.search) conditions.push(ilike(workoutPlans.name, `%${filters.search}%`))
  // ... paginacao existente
}
```

##### 1.4 Service — ApplyWorkoutTemplateService

```typescript
// POST /workout-plans/:id/apply
async execute(templateId: string, dto: ApplyTemplateDto, personalId: string) {
  // 1. Buscar o template e validar ownership + tipo
  const template = await this.workoutPlansRepository.findById(templateId, personalId)
  if (!template) throw new NotFoundException('Modelo de treino nao encontrado')
  if (template.planKind !== 'template')
    throw new BadRequestException('Somente modelos podem ser aplicados')

  // 2. Validar aluno se informado
  let student = null
  if (dto.studentId) {
    student = await this.studentsRepository.findById(dto.studentId, personalId)
    if (!student) throw new BadRequestException('Aluno nao encontrado ou nao pertence a este personal')
  }

  // 3. Copiar plano + exercicios em transacao
  const newPlan = await this.db.transaction(async (tx) => {
    const plan = await this.workoutPlansRepository.create({
      personalId,
      name: `Copia de ${template.name}`,
      description: template.description,
      planKind: 'student',
      sourceTemplateId: template.id,
    }, tx)

    // Copiar exercicios preservando todos os campos
    const exercises = await this.workoutExercisesRepository.findByPlan(templateId)
    if (exercises.length > 0) {
      await this.workoutExercisesRepository.createMany(
        exercises.map(e => ({
          workoutPlanId: plan.id,
          exerciseId: e.exerciseId,
          sets: e.sets,
          reps: e.reps,
          weight: e.weight,
          notes: e.notes,
          order: e.order,
        })),
        tx
      )
    }

    // Atribuir ao aluno se informado
    if (dto.studentId) {
      await this.workoutPlanStudentsRepository.create({ workoutPlanId: plan.id, studentId: dto.studentId }, tx)
    }

    return plan
  })

  return newPlan
}
```

##### 1.5 DTO de apply

```typescript
export const ApplyTemplateSchema = z.object({
  studentId: z.string().uuid().optional(),
})
```

##### 1.6 Cenarios de erro

| Cenario | Excecao | Mensagem |
|---------|---------|----------|
| Plano nao encontrado / outro tenant | `NotFoundException` | "Modelo de treino nao encontrado" |
| Plano nao e template (e student) | `BadRequestException` | "Somente modelos podem ser aplicados" |
| `studentId` informado mas invalido | `BadRequestException` | "Aluno nao encontrado ou nao pertence a este personal" |
| Falha na transacao de copia | Relanca erro (500) | — |

---

#### 2. Frontend

##### 2.1 Estrutura de abas em /painel/treinos

```
<Tabs defaultValue="templates">
  <TabsList>
    <TabsTrigger value="templates">Modelos</TabsTrigger>
    <TabsTrigger value="student">Por aluno</TabsTrigger>
  </TabsList>

  <TabsContent value="templates">
    <WorkoutPlanList kind="template" />
  </TabsContent>

  <TabsContent value="student">
    <WorkoutPlanList kind="student" showStudentFilter />
  </TabsContent>
</Tabs>
```

##### 2.2 Filtro por aluno na aba "Por aluno"

```
Input de busca local — filtra sobre os dados ja carregados (nao nova request)
OU query param no GET /workout-plans:
  - Adicionar campo studentSearch no hook
  - Pesquisa por nome do aluno associado ao plano

Recomendacao: filtro local e mais simples para MVP.
A listagem de planos pode incluir o nome do aluno associado no response.
```

##### 2.3 Dialog "Aplicar para aluno"

```
Titulo: "Aplicar modelo ao aluno"
Descricao: "Sera criada uma copia editavel de '[nome do modelo]'"

Campos:
  - Aluno (Combobox, opcional): busca em GET /students
  - Aviso: "Se nao selecionar um aluno agora, voce pode atribuir depois"

Botoes:
  - "Cancelar"
  - "Aplicar" (disabled se isPending)

Apos sucesso:
  - toast.success com link "Abrir copia" → navega para /painel/treinos/:newPlanId
  - invalidateQueries(['workout-plans'])
  - Fechar dialog
```

##### 2.4 Formulario de criacao — adicionar campo planKind

```
Toggle ou Select discreto:
  "Tipo: Modelo ▾"  (opcoes: Modelo / Especifico por aluno)
  Default: Modelo
  Visivel apenas no formulario de criacao (nao no de edicao)
```

##### 2.5 Cenarios de erro — Frontend

| Cenario | Comportamento |
|---------|---------------|
| API retorna 400 (nao e template) | Toast com mensagem (edge case, UI so exibe botao em modelos) |
| Aluno invalido | Toast com mensagem da API |
| Transacao falha (500) | Toast "Erro ao aplicar modelo. Tente novamente" |

---

#### 3. Testes — Backend (US-029)

```typescript
describe('ApplyWorkoutTemplateService', () => {
  it('cria copia do plano com todos os exercicios', async () => { ... })
  it('novo plano tem planKind = student e sourceTemplateId correto', async () => { ... })
  it('nome da copia e "Copia de [nome]"', async () => { ... })
  it('atribui ao aluno quando studentId informado', async () => { ... })
  it('cria plano sem atribuicao quando studentId omitido', async () => { ... })
  it('retorna 404 para template inexistente', async () => { ... })
  it('retorna 400 ao tentar aplicar plano do tipo student', async () => { ... })
  it('retorna 400 para aluno de outro tenant', async () => { ... })
  it('rollback completo se insercao de exercicios falhar', async () => { ... })
})

describe('ListWorkoutPlansService (ajuste)', () => {
  it('filtra por kind=template corretamente', async () => { ... })
  it('filtra por kind=student corretamente', async () => { ... })
  it('retorna todos quando kind nao informado', async () => { ... })
})
```

---


## US-029 — Guia visual de execucao em exercicios

**Status:** `[x]` done
**Sprint:** 9
**Dependencias:** US-007

**Descricao:**
Como aluno, quero ver uma demonstracao visual de como executar cada exercicio da minha ficha, para treinar com mais seguranca e sem depender de explicacoes textuais. Como personal, quero enriquecer exercicios customizados com um link do YouTube quando quiser dar uma instrucao mais personalizada.

**Decisao de arquitetura — sem S3, sem upload:**
- Exercicios **globais** (os 50+ pre-cadastrados): recebem GIF automatico via mapeamento com a [ExerciseDB](https://exercisedb.p.rapidapi.com). A URL do GIF e armazenada no banco uma unica vez (no seed/migration), servida diretamente da CDN publica da ExerciseDB — custo zero de storage.
- Exercicios **customizados** (criados pelo personal): campo opcional de URL do YouTube. O personal cola o link do proprio canal; o frontend embeda o player.
- **Sem upload de arquivo, sem S3, sem multipart** — infraestrutura eliminada.

---

### Modelo de Dados

| Coluna | Tipo | Descricao |
|--------|------|-----------|
| `exercisedb_gif_url` | text nullable | URL do GIF da CDN do ExerciseDB (exercicios globais) |
| `youtube_url` | text nullable | URL do YouTube (exercicios customizados do personal) |

Regra de negocio:
- Exercicio global: pode ter `exercisedb_gif_url`. Nao aceita `youtube_url`.
- Exercicio customizado (personal): pode ter `youtube_url`. Nao aceita `exercisedb_gif_url` (campo gerenciado apenas pelo sistema).

---

### Criterios de Aceite

#### Exercicios Globais — GIF automatico
- [ ] Os 50+ exercicios globais do seed tem `exercisedb_gif_url` preenchida com a URL do GIF correspondente na ExerciseDB
- [x] Aluno ve o GIF animado no detalhe do exercicio dentro da ficha de treino
- [x] Se o exercicio global nao tiver mapeamento (exercicio muito especifico), exibe placeholder "Sem demonstracao disponivel"

#### Exercicios Customizados — Link do YouTube
- [x] Personal pode salvar uma URL do YouTube no formulario de criacao/edicao do exercicio
- [x] Apenas URLs do dominio `youtube.com` ou `youtu.be` sao aceitas
- [x] Aluno ve o video embedado (iframe do YouTube) no detalhe do exercicio
- [x] Personal pode remover o link (campo vazio = sem demonstracao)

#### Exibicao (ambos os tipos)
- [x] Prioridade de exibicao: YouTube > GIF do ExerciseDB > placeholder
- [x] Placeholder visual quando nao ha nenhuma midia configurada
- [x] Midia exibida apenas na area do aluno — no painel do personal exibir apenas preview discreto (thumbnail ou label)

---

### Subtasks Backend
- [x] Migration: adicionar `exercisedb_gif_url` e `youtube_url` em `exercises`
- [ ] Atualizar seed: mapear os 50 exercicios globais com suas URLs do ExerciseDB
- [x] `PATCH /exercises/:id/youtube-url` — salvar/remover URL do YouTube (apenas exercicios do personal)
- [x] Validar que a URL e do YouTube (dominio allowlist)
- [x] Incluir `exercisedbGifUrl` e `youtubeUrl` no response de `GET /exercises` e `GET /exercises/:id`
- [x] Unit tests

### Subtasks Frontend
- [x] Campo "Link do YouTube" no formulario de exercicio customizado
- [x] Componente `ExercicioMidia` na area do aluno (GIF ou iframe YouTube)
- [x] Placeholder quando sem midia
- [x] Preview discreto no painel do personal (so mostrar que tem video)

---

### Plano de Implementacao — US-028

#### 1. Backend

##### 1.1 Migration

```sql
ALTER TABLE "exercises"
  ADD COLUMN "exercisedb_gif_url" text,
  ADD COLUMN "youtube_url" text;
```

##### 1.2 Schema Drizzle

```typescript
// Adicionar em schema/exercises.ts
exercisedbGifUrl: text('exercisedb_gif_url'),
youtubeUrl: text('youtube_url'),
```

##### 1.3 Atualizacao do Seed

O seed ja popula 50 exercicios globais. Adicionar o campo `exercisedbGifUrl` para cada um.

**Como obter os GIF URLs:**
A ExerciseDB tem endpoint publico (com chave RapidAPI gratuita) que retorna exercicios com `gifUrl`. O processo e feito uma unica vez, offline, pelo dev:

```bash
# Script utilitario (rodar uma vez para gerar o mapeamento)
# GET https://exercisedb.p.rapidapi.com/exercises?limit=1300
# Salvar o campo gifUrl para cada exercicio encontrado por nome
# Atualizar o array de seed com os gifUrls correspondentes
```

Exemplo do seed atualizado:
```typescript
{ name: 'Agachamento', muscleGroup: 'quadriceps', isGlobal: true,
  exercisedbGifUrl: 'https://v2.exercisedb.io/image/abc123.gif' },
{ name: 'Supino Reto', muscleGroup: 'chest', isGlobal: true,
  exercisedbGifUrl: 'https://v2.exercisedb.io/image/def456.gif' },
// ...
```

> Exercicios que nao tiverem correspondencia no ExerciseDB ficam com `exercisedbGifUrl: null` — sem problema, o placeholder cuida disso.

##### 1.4 Endpoint — PATCH /exercises/:id/youtube-url

```
src/modules/exercises/
  update-youtube-url/
    update-youtube-url.controller.ts
    update-youtube-url.service.ts
    dtos/
      request.dto.ts
    tests/
      update-youtube-url.service.spec.ts
      update-youtube-url.controller.spec.ts
```

**DTO:**
```typescript
// Allowlist de dominios aceitos
const YOUTUBE_DOMAINS = ['youtube.com', 'www.youtube.com', 'youtu.be']

export const UpdateYoutubeUrlSchema = z.object({
  youtubeUrl: z
    .string()
    .url('URL invalida')
    .refine((url) => {
      try {
        const { hostname } = new URL(url)
        return YOUTUBE_DOMAINS.includes(hostname)
      } catch {
        return false
      }
    }, 'Apenas links do YouTube sao aceitos (youtube.com ou youtu.be)')
    .nullable(),
  // null = remover o link
})
```

**Service:**
```typescript
async execute(exerciseId: string, dto: UpdateYoutubeUrlDto, personalId: string) {
  const parsed = UpdateYoutubeUrlSchema.safeParse(dto)
  if (!parsed.success) throw new BadRequestException(parsed.error.errors[0].message)

  // 1. Buscar exercicio e validar ownership
  const exercise = await this.exercisesRepository.findById(exerciseId)
  if (!exercise) throw new NotFoundException('Exercicio nao encontrado')

  // 2. Exercicios globais nao aceitam youtube_url (gerenciados pelo sistema)
  if (!exercise.personalId)
    throw new ForbiddenException('Exercicios globais nao podem receber link do YouTube')

  // 3. Validar que pertence ao personal logado
  if (exercise.personalId !== personalId)
    throw new ForbiddenException('Sem permissao para editar este exercicio')

  // 4. Atualizar
  await this.exercisesRepository.updateYoutubeUrl(exerciseId, dto.youtubeUrl)
  return { youtubeUrl: dto.youtubeUrl }
}
```

##### 1.5 Repository — novos metodos

```typescript
async updateYoutubeUrl(exerciseId: string, youtubeUrl: string | null): Promise<void>
```

##### 1.6 Response DTO — atualizar ExerciseDto

```typescript
// Adicionar em ExerciseDto
exercisedbGifUrl: string | null   // URL do GIF da CDN ExerciseDB
youtubeUrl: string | null          // URL do YouTube (exercicios customizados)
```

##### 1.7 Utilitario — extrair video ID do YouTube

```typescript
// exercises.utils.ts — usado apenas no frontend, mas documentado aqui para referencia
export function extractYouTubeVideoId(url: string): string | null {
  try {
    const { hostname, pathname, searchParams } = new URL(url)
    if (hostname === 'youtu.be') return pathname.slice(1)       // youtu.be/{id}
    if (hostname.includes('youtube.com')) return searchParams.get('v') // youtube.com/watch?v={id}
    return null
  } catch {
    return null
  }
}
// URL de embed: https://www.youtube.com/embed/{videoId}
```

##### 1.8 Cenarios de erro — Backend

| Cenario | Excecao | Mensagem |
|---------|---------|----------|
| Exercicio nao encontrado | `NotFoundException` | "Exercicio nao encontrado" |
| Exercicio global recebe youtube_url | `ForbiddenException` | "Exercicios globais nao podem receber link do YouTube" |
| Exercicio customizado de outro personal | `ForbiddenException` | "Sem permissao para editar este exercicio" |
| URL invalida (formato errado) | `BadRequestException` | "URL invalida" |
| URL de outro dominio (ex: vimeo.com) | `BadRequestException` | "Apenas links do YouTube sao aceitos" |
| `youtubeUrl: null` (remover link) | Sucesso — limpa o campo | — |

---

#### 2. Frontend

##### 2.1 Campo no formulario de exercicio customizado

```typescript
// Adicionar no formulario de criacao/edicao de exercicio CUSTOMIZADO
// Nao exibir para exercicios globais (isGlobal === true)

<div className="space-y-1">
  <Label htmlFor="youtubeUrl">Link do YouTube (opcional)</Label>
  <Input
    id="youtubeUrl"
    placeholder="https://youtube.com/watch?v=..."
    {...register('youtubeUrl')}
  />
  <p className="text-xs text-muted-foreground">
    Cole o link de um video do YouTube demonstrando o exercicio
  </p>
  {errors.youtubeUrl && (
    <p className="text-xs text-destructive">{errors.youtubeUrl.message}</p>
  )}
</div>
```

**Validacao client-side (schema Zod do form):**
```typescript
youtubeUrl: z
  .string()
  .refine(url => {
    if (!url) return true  // opcional
    try {
      const { hostname } = new URL(url)
      return ['youtube.com', 'www.youtube.com', 'youtu.be'].includes(hostname)
    } catch { return false }
  }, 'Apenas links do YouTube sao aceitos')
  .optional()
  .or(z.literal(''))
```

##### 2.2 Service

```typescript
// services/exercises.service.ts — adicionar funcao
export const updateExerciseYoutubeUrl = (
  exerciseId: string,
  youtubeUrl: string | null,
) => api.patch(`/exercises/${exerciseId}/youtube-url`, { youtubeUrl })
```

##### 2.3 Hook

```typescript
export function useUpdateExerciseYoutubeUrl(exerciseId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (youtubeUrl: string | null) =>
      updateExerciseYoutubeUrl(exerciseId, youtubeUrl),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['exercises'] })
      toast.success('Link atualizado com sucesso')
    },
    onError: (err: AxiosError<ApiError>) => {
      toast.error(err.response?.data?.message ?? 'URL invalida ou nao permitida')
    },
  })
}
```

##### 2.4 Componente ExercicioMidia — area do aluno

```typescript
// Usado em /{slug}/alunos/treinos/:planId — dentro de cada exercicio da ficha

interface ExercicioMidiaProps {
  exercisedbGifUrl: string | null
  youtubeUrl: string | null
  exerciseName: string
}

function ExercicioMidia({ exercisedbGifUrl, youtubeUrl, exerciseName }: ExercicioMidiaProps) {
  // Prioridade: YouTube > GIF ExerciseDB > placeholder
  if (youtubeUrl) {
    const videoId = extractYouTubeVideoId(youtubeUrl)
    if (videoId) return (
      <div className="aspect-video w-full rounded-lg overflow-hidden">
        <iframe
          src={`https://www.youtube.com/embed/${videoId}`}
          title={`Demonstracao: ${exerciseName}`}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          className="w-full h-full"
          loading="lazy"
        />
      </div>
    )
  }

  if (exercisedbGifUrl) return (
    <img
      src={exercisedbGifUrl}
      alt={`Demonstracao: ${exerciseName}`}
      className="w-full max-h-56 object-contain rounded-lg"
      loading="lazy"
    />
  )

  return (
    <div className="flex items-center gap-2 py-3 text-sm text-muted-foreground">
      <ImageOff size={16} />
      <span>Sem demonstracao disponivel</span>
    </div>
  )
}
```

##### 2.5 Preview no painel do personal (formulario de exercicio)

```
No formulario/detalhe do exercicio do personal:
  - Se exercicio global com GIF: exibir thumbnail do GIF (pequeno, 80x80px) + label "GIF automatico"
  - Se exercicio customizado com YouTube: exibir thumbnail do YouTube + botao "Remover link"
    Thumbnail URL: https://img.youtube.com/vi/{videoId}/mqdefault.jpg (sem requisicao ao YouTube)
  - Se sem midia: mostrar o campo de input para YouTube (exercicios customizados)
                  ou mensagem "Exercicio global sem GIF mapeado" (exercicios globais)
```

##### 2.6 Cenarios de erro — Frontend

| Cenario | Comportamento |
|---------|---------------|
| URL nao e YouTube (ex: vimeo) | Erro inline sob o campo antes de enviar (validacao Zod) |
| URL malformada | Erro inline "URL invalida" |
| GIF do ExerciseDB indisponivel | `<img>` com `onError` → exibe placeholder automaticamente |
| YouTube bloqueado (iframe) | Iframe exibe mensagem nativa do YouTube "Video indisponivel" |
| Campo vazio + salvar | `youtubeUrl: null` → remove o link, sucesso silencioso |
| API retorna 403 (global) | Toast com mensagem da API (edge case) |

---

#### 3. Testes — Backend (US-028)

```typescript
describe('UpdateYoutubeUrlService', () => {
  it('salva youtube_url valida em exercicio customizado', async () => { ... })
  it('remove youtube_url quando recebe null', async () => { ... })
  it('retorna 400 para URL que nao e do YouTube', async () => { ... })
  it('retorna 400 para URL com formato invalido', async () => { ... })
  it('retorna 403 para exercicio global', async () => { ... })
  it('retorna 403 para exercicio de outro personal', async () => { ... })
  it('retorna 404 para exercicio inexistente', async () => { ... })
  it('aceita youtu.be como dominio valido', async () => { ... })
  it('aceita www.youtube.com como dominio valido', async () => { ... })
})
```

---

#### 4. Observacao — Mapeamento ExerciseDB

O mapeamento dos 50 exercicios globais com o ExerciseDB e feito **uma unica vez** pelo dev, antes de rodar em producao:

1. Acessar `https://exercisedb.p.rapidapi.com/exercises?limit=1300` com chave gratuita do RapidAPI
2. Cruzar os nomes com os exercicios do seed (match por nome aproximado ou manual)
3. Inserir os `gifUrl` retornados diretamente no array do `seed.ts`
4. Commitar — pronto, CDN do ExerciseDB serve os GIFs gratuitamente

Nenhuma chave de API e necessaria em producao — as URLs dos GIFs sao publicas e permanentes.

---


## US-030 — Duplicar ficha/modelo com 1 clique

**Status:** `[ ]` todo
**Sprint:** 10
**Dependencias:** US-029

**Descricao:**
Como personal, quero duplicar uma ficha rapidamente para criar variacoes sem reconstruir todos os exercicios do zero.

### Criterios de Aceite
- [ ] Acao "Duplicar" em treinos `template` e `student`
- [ ] Copia inclui exercicios, ordem, series, reps, carga e notas
- [ ] Nome padrao: "Copia de <nome>"
- [ ] `planKind` da copia e o mesmo do original
- [ ] `sourceTemplateId` da copia: `null`

### Subtasks Backend
- [ ] `POST /workout-plans/:id/duplicate`
- [ ] Duplicacao transacional: plano + exercicios
- [ ] Unit tests

### Subtasks Frontend
- [ ] Botao "Duplicar" nas listagens e no detalhe
- [ ] Toast com link "Abrir copia"
- [ ] Loading state

---

### Plano de Implementacao — US-030

#### 1. Backend

##### 1.1 Sem migration necessaria
Usa as colunas adicionadas em US-029 (`plan_kind`, `source_template_id`).

##### 1.2 Estrutura de arquivos

```
src/modules/workout-plans/
  duplicate/
    duplicate-workout-plan.controller.ts
    duplicate-workout-plan.service.ts
    tests/
      duplicate-workout-plan.service.spec.ts
      duplicate-workout-plan.controller.spec.ts
```

##### 1.3 Service — DuplicateWorkoutPlanService

```typescript
async execute(planId: string, personalId: string) {
  // 1. Buscar plano original e validar ownership
  const original = await this.workoutPlansRepository.findWithExercises(planId, personalId)
  if (!original) throw new NotFoundException('Plano de treino nao encontrado')

  // 2. Copiar em transacao
  return this.db.transaction(async (tx) => {
    // Criar novo plano
    const copy = await this.workoutPlansRepository.create({
      personalId,
      name: `Copia de ${original.name}`,
      description: original.description,
      planKind: original.planKind,
      sourceTemplateId: null,  // copia e independente
    }, tx)

    // Copiar exercicios preservando todos os atributos
    if (original.exercises.length > 0) {
      await this.workoutExercisesRepository.createMany(
        original.exercises.map(e => ({
          workoutPlanId: copy.id,
          exerciseId: e.exerciseId,
          sets: e.sets,
          reps: e.reps,
          weight: e.weight,
          notes: e.notes,
          order: e.order,
        })),
        tx
      )
    }

    return copy
  })
}
```

> **Nota:** `findWithExercises` e um metodo de repository que faz join com `workout_exercises` — reutilizar ou criar se nao existir.

##### 1.4 Response

```typescript
// Retorna o novo plano criado (mesmo shape do WorkoutPlanDto existente)
// O frontend usa o id retornado para montar o link "Abrir copia"
```

##### 1.5 Cenarios de erro

| Cenario | Excecao | Mensagem |
|---------|---------|----------|
| Plano nao encontrado / outro tenant | `NotFoundException` | "Plano de treino nao encontrado" |
| Plano sem exercicios | Sucesso — copia vazia e valida |
| Falha na transacao | Relanca erro (500) |

---

#### 2. Frontend

##### 2.1 Locais do botao "Duplicar"

```
1. Na listagem de treinos (cada card/row):
   - Dropdown de acoes (⋮): "Editar" | "Duplicar" | "Excluir"

2. Na tela de detalhe do treino (/painel/treinos/:id):
   - Botao secundario no header: "Duplicar treino"
```

##### 2.2 Hook

```typescript
export function useDuplicateWorkoutPlan() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (planId: string) => duplicateWorkoutPlan(planId),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['workout-plans'] })
      toast.success('Treino duplicado', {
        action: {
          label: 'Abrir copia',
          onClick: () => router.push(`/painel/treinos/${data.id}`),
        },
        duration: 5000,  // dar tempo para o usuario clicar
      })
    },
    onError: (err: AxiosError<ApiError>) => {
      toast.error(err.response?.data?.message ?? 'Erro ao duplicar treino')
    },
  })
}
```

##### 2.3 Comportamento do botao

```
- Sem dialog de confirmacao (acao nao-destrutiva)
- Loading state: icone de spinner no botao durante isPending
- Botao desabilitado durante isPending (evita duplo clique)
- Apos sucesso: lista atualizada automaticamente via invalidateQueries
```

##### 2.4 Cenarios de erro — Frontend

| Cenario | Comportamento |
|---------|---------------|
| API retorna 404 | Toast de erro (edge case — botao so aparece para planos existentes) |
| Erro de rede | Toast "Falha na conexao. Tente novamente" |
| Double click no botao | isPending desabilita o botao automaticamente |

---

#### 3. Testes — Backend (US-030)

```typescript
describe('DuplicateWorkoutPlanService', () => {
  it('cria copia do plano com nome "Copia de [nome]"', async () => { ... })
  it('copia inclui todos os exercicios com mesmos atributos', async () => { ... })
  it('planKind da copia e igual ao original', async () => { ... })
  it('sourceTemplateId da copia e null', async () => { ... })
  it('copia de plano sem exercicios e valida (array vazio)', async () => { ... })
  it('retorna 404 para plano de outro tenant', async () => { ... })
  it('rollback se insercao de exercicios falhar', async () => { ... })
})
```

---

## US-031 — Tema dark/light no painel do personal

**Status:** `[ ]` todo
**Sprint:** 11
**Dependencias:** US-003

**Descricao:**
Como personal, quero escolher entre tema claro e escuro no painel para melhorar conforto visual conforme minha preferencia.

### Criterios de Aceite
- [ ] Preferencia salva no perfil (persistida entre sessoes e dispositivos)
- [ ] Toggle acessivel no painel
- [ ] Padrao inicial: tema claro (`light`)
- [ ] Admin e area do aluno mantem seus temas fixos (dark)

### Subtasks Backend
- [ ] Migration: `ui_theme` em `personals`
- [ ] `uiTheme` no GET e PATCH de `/personals/me/profile`
- [ ] Unit tests

### Subtasks Frontend
- [ ] Integrar `next-themes` no shell do painel
- [ ] Toggle em /painel/perfil sincroniza com backend
- [ ] Tema do painel nao vaza para admin ou area do aluno

---

### Plano de Implementacao — US-031

#### 1. Backend

##### 1.1 Migration

```sql
ALTER TABLE "personals"
  ADD COLUMN "ui_theme" varchar(5) NOT NULL DEFAULT 'light';
-- Valores: 'light' | 'dark'
-- Personals existentes recebem 'light' pelo DEFAULT
```

##### 1.2 Schema Drizzle

```typescript
// Adicionar em schema/personals.ts
uiTheme: varchar('ui_theme', { length: 5 })
  .$type<'light' | 'dark'>()
  .notNull()
  .default('light'),
```

##### 1.3 Ajustes nos DTOs existentes

```typescript
// GetProfileResponseDto — adicionar campo
uiTheme: 'light' | 'dark'

// UpdateProfileRequestDto (schema Zod) — adicionar campo opcional
uiTheme: z.enum(['light', 'dark']).optional()
```

> **Sem novo endpoint** — reutiliza o `PATCH /personals/me/profile` existente.
> O service de update ja faz safeParse e atualiza os campos fornecidos.
> Apenas garantir que `uiTheme` esta incluso no set de campos atualizaveis.

##### 1.4 Cenarios de erro

| Cenario | Excecao | Mensagem |
|---------|---------|----------|
| Valor invalido (ex: 'blue') | `BadRequestException` (Zod) | "uiTheme deve ser 'light' ou 'dark'" |

---

#### 2. Frontend

##### 2.1 Instalacao

```bash
npm install next-themes
```

##### 2.2 Configuracao do ThemeProvider — SOMENTE no layout do painel

```typescript
// app/painel/layout.tsx
// O ThemeProvider envolve APENAS o layout do painel (/painel/*)
// Admin e area do aluno NAO usam esse provider — mantem dark fixo

import { ThemeProvider } from 'next-themes'

export default function PainelLayout({ children }) {
  return (
    <ThemeProvider
      attribute="class"          // adiciona class="dark" no <html>
      defaultTheme="light"
      enableSystem={false}       // nao seguir preferencia do SO — usar o salvo no perfil
      storageKey="painel-theme"  // chave isolada do localStorage
    >
      <PainelShell>{children}</PainelShell>
    </ThemeProvider>
  )
}
```

**Importante — isolamento de temas:**
- `/app/admin/layout.tsx`: usa `className="dark"` fixo no elemento raiz, SEM ThemeProvider
- `/app/[personal-slug]/(students)/layout.tsx`: usa `className="dark"` fixo, SEM ThemeProvider
- Cada layout e independente — nao ha conflito

##### 2.3 Sincronizacao com o backend

```typescript
// Em PainelShell ou hook usePersonalTheme
// Executa uma vez ao montar o shell do painel

function useSyncPersonalTheme() {
  const { setTheme } = useTheme()
  const { data: profile } = usePersonalProfile()  // query existente

  useEffect(() => {
    if (profile?.uiTheme) {
      setTheme(profile.uiTheme)
    }
  }, [profile?.uiTheme])
}
```

##### 2.4 Toggle em /painel/perfil (secao Aparencia)

```typescript
function AparenciaSection() {
  const { theme, setTheme } = useTheme()
  const { mutate: updateProfile } = useUpdateProfile()

  const handleThemeChange = (newTheme: 'light' | 'dark') => {
    setTheme(newTheme)  // aplica imediatamente (otimista)
    updateProfile(
      { uiTheme: newTheme },
      {
        onError: () => {
          // Reverter se API falhar
          setTheme(theme!)
          toast.error('Erro ao salvar preferencia de tema')
        },
      }
    )
  }

  return (
    <section>
      <h3>Aparencia</h3>
      <div className="flex gap-3">
        <ThemeOptionCard
          label="Claro"
          value="light"
          selected={theme === 'light'}
          onClick={() => handleThemeChange('light')}
        />
        <ThemeOptionCard
          label="Escuro"
          value="dark"
          selected={theme === 'dark'}
          onClick={() => handleThemeChange('dark')}
        />
      </div>
    </section>
  )
}
```

> `ThemeOptionCard`: card visual com preview de cores (branco vs cinza escuro) + checkmark quando selecionado.

##### 2.5 Checklist de componentes do painel para ambos os temas

```
Verificar que estas classes do Tailwind funcionam em dark mode:
  - bg-background / bg-card / bg-muted (usar variaveis CSS, nao cores fixas)
  - text-foreground / text-muted-foreground
  - border-border

Evitar cores hardcoded como:
  - bg-white → usar bg-background
  - text-gray-900 → usar text-foreground
  - border-gray-200 → usar border-border
```

##### 2.6 Cenarios de erro — Frontend

| Cenario | Comportamento |
|---------|---------------|
| Profile nao carregado ainda | Usa `defaultTheme="light"` do ThemeProvider |
| API falha ao salvar tema | Reverter tema localmente + toast de erro |
| `next-themes` hydration mismatch | Adicionar `suppressHydrationWarning` no `<html>` do root layout |
| Troca de tema com flash (FOUC) | `next-themes` ja previne por padrao com `attribute="class"` |

---

#### 3. Testes — Backend (US-031)

```typescript
describe('UpdatePersonalProfileService (ajuste para uiTheme)', () => {
  it('atualiza uiTheme para dark com sucesso', async () => { ... })
  it('atualiza uiTheme para light com sucesso', async () => { ... })
  it('retorna 400 para valor invalido de uiTheme', async () => { ... })
  it('uiTheme e retornado no GET /personals/me/profile', async () => { ... })
  it('nao afeta outros campos ao atualizar apenas uiTheme', async () => { ... })
})
```
