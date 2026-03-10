# Epic 11 — Treinos, Midia e Tema

Status: `[ ]` todo

---

## US-028 — Midia de execucao em exercicios (video/gif)

**Status:** `[ ]` todo
**Sprint:** 9
**Dependencias:** US-007

**Descricao:**
Como personal, quero anexar video ou gif em exercicios para que o aluno entenda melhor a execucao sem precisar de instrucoes textuais extensas.

### Criterios de Aceite
- [ ] Exercicio aceita `mediaUrl` e `mediaType` (`video` | `gif`)
- [ ] Upload validado: `video/mp4` max 50MB, `image/gif` max 10MB
- [ ] Aluno visualiza a midia no detalhe do treino
- [ ] Fallback visual quando sem midia
- [ ] Personal pode remover midia existente

### Subtasks Backend
- [ ] Migration: `media_url` e `media_type` em `exercises`
- [ ] `POST /exercises/:id/media` — upload multipart S3
- [ ] `DELETE /exercises/:id/media` — remove do S3 e banco
- [ ] Unit tests: upload valido, tipo invalido, tamanho excedido, remocao

### Subtasks Frontend
- [ ] Zona de upload com preview no formulario de exercicio
- [ ] Render de video/gif no treino do aluno
- [ ] Validacao client-side de tipo e tamanho

---

### Plano de Implementacao — US-028

#### 1. Backend

##### 1.1 Migration

```sql
-- Adicionar enum e colunas em exercises
ALTER TABLE "exercises"
  ADD COLUMN "media_url" text,
  ADD COLUMN "media_type" varchar(5);
-- media_type: 'video' | 'gif' | NULL
-- Nao usar pg enum para facilitar migracao futura
```

##### 1.2 Schema Drizzle

```typescript
// Adicionar em schema/exercises.ts
mediaUrl: text('media_url'),
mediaType: varchar('media_type', { length: 5 }).$type<'video' | 'gif'>(),
```

##### 1.3 Estrutura de arquivos

```
src/modules/exercises/
  upload-media/
    upload-media.controller.ts
    upload-media.service.ts
    tests/
      upload-media.service.spec.ts
  delete-media/
    delete-media.controller.ts
    delete-media.service.ts
    tests/
      delete-media.service.spec.ts
```

##### 1.4 Controller — Upload

```typescript
@Post(':id/media')
@UseInterceptors(FileInterceptor('file'))
@Roles(Role.PERSONAL)
async handle(
  @Param('id') id: string,
  @UploadedFile() file: Express.Multer.File,
  @CurrentUser() user: IAccessToken,
) {
  return this.service.execute(id, file, user.profileId)
}
```

**Configuracao do interceptor (validacao de tamanho e tipo no pipe):**
```typescript
@UploadedFile(
  new ParseFilePipe({
    validators: [
      new MaxFileSizeValidator({ maxSize: 50 * 1024 * 1024 }), // 50MB max
      new FileTypeValidator({ fileType: /(video\/mp4|image\/gif)/ }),
    ],
  }),
)
```

> **Nota:** O `MaxFileSizeValidator` aplica 50MB para todos. A validacao diferenciada por tipo (gif max 10MB) deve ser feita no service, pois o pipe nao tem acesso ao tipo no momento da validacao de tamanho.

##### 1.5 Service — UploadExerciseMediaService

```typescript
async execute(exerciseId: string, file: Express.Multer.File, personalId: string) {
  // 1. Buscar exercicio e validar ownership
  const exercise = await this.exercisesRepository.findById(exerciseId)
  if (!exercise) throw new NotFoundException('Exercicio nao encontrado')
  // Exercicios globais (personalId = null) nao aceitam upload de midia
  if (exercise.personalId !== personalId)
    throw new ForbiddenException('Sem permissao para editar este exercicio')

  // 2. Validar tipo MIME (redundante com pipe, mas defesa em profundidade)
  const allowedMimes = ['video/mp4', 'image/gif']
  if (!allowedMimes.includes(file.mimetype))
    throw new BadRequestException('Tipo de arquivo invalido. Aceito: MP4 e GIF')

  // 3. Validar tamanho por tipo
  const mediaType = file.mimetype === 'video/mp4' ? 'video' : 'gif'
  const maxSizeByType = { video: 50 * 1024 * 1024, gif: 10 * 1024 * 1024 }
  if (file.size > maxSizeByType[mediaType])
    throw new BadRequestException(
      mediaType === 'gif'
        ? 'GIF deve ter no maximo 10MB'
        : 'Video deve ter no maximo 50MB'
    )

  // 4. Se ja existe midia, remover do S3 antes de fazer upload do novo
  if (exercise.mediaUrl) {
    await this.s3Provider.delete(exercise.mediaUrl).catch(() => {
      // Logar mas nao bloquear o upload do novo arquivo
      this.logger.warn(`Falha ao remover midia antiga: ${exercise.mediaUrl}`)
    })
  }

  // 5. Upload para S3
  const key = `exercises/${personalId}/${exerciseId}/${Date.now()}.${mediaType === 'video' ? 'mp4' : 'gif'}`
  const url = await this.s3Provider.upload(file.buffer, key, file.mimetype)

  // 6. Atualizar banco
  await this.exercisesRepository.updateMedia(exerciseId, url, mediaType)

  return { mediaUrl: url, mediaType }
}
```

##### 1.6 Service — DeleteExerciseMediaService

```typescript
async execute(exerciseId: string, personalId: string) {
  const exercise = await this.exercisesRepository.findById(exerciseId)
  if (!exercise) throw new NotFoundException('Exercicio nao encontrado')
  if (exercise.personalId !== personalId)
    throw new ForbiddenException('Sem permissao para editar este exercicio')
  if (!exercise.mediaUrl)
    throw new BadRequestException('Este exercicio nao possui midia')

  // 1. Remover do S3 (fire-and-forget tolerante a falha)
  await this.s3Provider.delete(exercise.mediaUrl).catch(() =>
    this.logger.warn(`Falha ao remover arquivo S3: ${exercise.mediaUrl}`)
  )

  // 2. Limpar campos no banco independentemente do resultado S3
  await this.exercisesRepository.updateMedia(exerciseId, null, null)
}
```

##### 1.7 Repository — novo metodo

```typescript
async updateMedia(
  exerciseId: string,
  mediaUrl: string | null,
  mediaType: 'video' | 'gif' | null,
): Promise<Exercise>
```

##### 1.8 Response DTO dos exercicios — atualizar

```typescript
// Adicionar em ExerciseDto (response existente)
mediaUrl: string | null
mediaType: 'video' | 'gif' | null
```

##### 1.9 Cenarios de erro

| Cenario | Excecao | Mensagem |
|---------|---------|----------|
| Exercicio nao encontrado | `NotFoundException` | "Exercicio nao encontrado" |
| Exercicio global (nao pertence ao personal) | `ForbiddenException` | "Sem permissao para editar este exercicio" |
| MIME invalido | `BadRequestException` | "Tipo de arquivo invalido. Aceito: MP4 e GIF" |
| GIF > 10MB | `BadRequestException` | "GIF deve ter no maximo 10MB" |
| Video > 50MB | `BadRequestException` | "Video deve ter no maximo 50MB" |
| Arquivo nenhum enviado (field vazio) | 400 do pipe NestJS | "File is required" |
| Delete sem midia existente | `BadRequestException` | "Este exercicio nao possui midia" |
| Falha no S3 ao fazer upload | Relanca erro (500) — falha critica | — |
| Falha no S3 ao remover antiga | Logado, nao bloqueia | — |

---

#### 2. Frontend

##### 2.1 Componente ExercicioMediaUpload

```
Estado:
  - preview: string | null   (object URL local antes de enviar)
  - mediaType: 'video' | 'gif' | null
  - uploading: boolean

Zona de upload (drag-and-drop + click):
  - Aceitar apenas .mp4 e .gif
  - Validacao client-side antes de chamar API:
      if (!['video/mp4', 'image/gif'].includes(file.type)) → toast de erro
      if (file.type === 'image/gif' && file.size > 10MB) → toast de erro
      if (file.type === 'video/mp4' && file.size > 50MB) → toast de erro

Preview local (antes do upload):
  - gif: <img src={URL.createObjectURL(file)} />
  - video: <video src={URL.createObjectURL(file)} controls />
  - Mostrar loader de upload com progresso (barra ou spinner)

Apos upload (mediaUrl salvo):
  - Exibir midia renderizada (gif ou video)
  - Botao "Remover midia" visivel
  - Botao "Trocar midia" (chama upload novamente)

Importante — limpeza de object URLs:
  useEffect(() => {
    return () => { if (preview) URL.revokeObjectURL(preview) }
  }, [preview])
```

##### 2.2 Hook

```typescript
export function useUploadExerciseMedia(exerciseId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (file: File) => uploadExerciseMedia(exerciseId, file),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['exercises'] })
      toast.success('Midia adicionada ao exercicio')
    },
    onError: (err: AxiosError<ApiError>) => {
      toast.error(err.response?.data?.message ?? 'Erro ao fazer upload')
    },
  })
}

export function useDeleteExerciseMedia(exerciseId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: () => deleteExerciseMedia(exerciseId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['exercises'] })
      toast.success('Midia removida')
    },
  })
}
```

##### 2.3 Service de upload (multipart)

```typescript
export const uploadExerciseMedia = (exerciseId: string, file: File) => {
  const form = new FormData()
  form.append('file', file)
  return api.post<{ mediaUrl: string; mediaType: string }>(
    `/exercises/${exerciseId}/media`,
    form,
    { headers: { 'Content-Type': 'multipart/form-data' } }
  )
}
```

##### 2.4 Render na area do aluno

```typescript
// Componente ExercicioMidia — usado em /{slug}/alunos/treinos/:id
function ExercicioMidia({ mediaUrl, mediaType }: { mediaUrl: string | null; mediaType: string | null }) {
  if (!mediaUrl) return (
    <div className="flex items-center gap-2 text-muted-foreground">
      <ImageOff size={16} /> Sem demonstracao disponivel
    </div>
  )

  if (mediaType === 'video') return (
    <video
      src={mediaUrl}
      controls
      playsInline
      preload="metadata"    // carrega apenas thumbnail, nao o video inteiro
      className="w-full rounded-lg max-h-64"
    />
  )

  return <img src={mediaUrl} alt="Demonstracao do exercicio" className="w-full rounded-lg max-h-64 object-contain" />
}
```

##### 2.5 Cenarios de erro — Frontend

| Cenario | Comportamento |
|---------|---------------|
| Arquivo de tipo errado selecionado | Toast imediato antes de qualquer upload |
| GIF > 10MB | Toast "GIF deve ter no maximo 10MB" antes do upload |
| Video > 50MB | Toast "Video deve ter no maximo 50MB" antes do upload |
| API retorna 403 (exercicio global) | Toast com mensagem da API |
| Upload falha (S3 indisponivel) | Toast de erro + preview local limpo |
| Video nao carrega na area do aluno | `<video>` exibe controles nativos de erro + fallback de texto |

---

#### 3. Testes — Backend (US-028)

```typescript
describe('UploadExerciseMediaService', () => {
  it('faz upload e atualiza banco com mediaUrl e mediaType', async () => { ... })
  it('remove midia antiga do S3 antes de fazer novo upload', async () => { ... })
  it('nao bloqueia se remocao da midia antiga falhar', async () => { ... })
  it('retorna 404 para exercicio inexistente', async () => { ... })
  it('retorna 403 para exercicio de outro personal', async () => { ... })
  it('retorna 400 para MIME invalido', async () => { ... })
  it('retorna 400 para gif acima de 10MB', async () => { ... })
  it('retorna 400 para video acima de 50MB', async () => { ... })
})

describe('DeleteExerciseMediaService', () => {
  it('remove do S3 e limpa campos no banco', async () => { ... })
  it('limpa banco mesmo se S3 falhar', async () => { ... })
  it('retorna 400 se exercicio nao tem midia', async () => { ... })
})
```

---

## US-029 — Separar fichas em modelo (generica) e especifica por aluno

**Status:** `[ ]` todo
**Sprint:** 10
**Dependencias:** US-008, US-009

**Descricao:**
Como personal, quero organizar minhas fichas em modelos reutilizaveis e fichas especificas por aluno para reduzir poluicao na listagem e facilitar a manutencao de treinos padronizados.

### Criterios de Aceite
- [ ] Workout plan possui tipo `planKind`: `template` ou `student`
- [ ] Ao criar plano, personal escolhe o tipo (padrao: `template`)
- [ ] Lista separada em abas: "Modelos" e "Por aluno"
- [ ] "Aplicar para aluno" cria copia editavel independente do modelo
- [ ] Aba "Por aluno" tem filtro por nome do aluno

### Subtasks Backend
- [ ] Migration: `plan_kind` e `source_template_id` em `workout_plans`
- [ ] Ajustar `GET /workout-plans?kind=`
- [ ] `POST /workout-plans/:id/apply`
- [ ] Unit tests

### Subtasks Frontend
- [ ] Refatorar `/painel/treinos` com Tabs
- [ ] Botao "Aplicar para aluno" com dialog
- [ ] Filtro por aluno na aba "Por aluno"

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
