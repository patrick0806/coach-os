# Code Review Report — Coach OS

**Data da análise:** 2026-03-12
**Escopo:** `backend/src` e `frontend/src`
**Revisores (AI Engineering Council):** Minerva, Dumbledore, Snape, Luna, Hermione, Ron, Harry

---

## 1. Visão Geral da Base de Código

### Backend (NestJS + Drizzle ORM)

Arquitetura bem estruturada seguindo o padrão de módulos por contexto (Vertical Slice). Cada módulo possui controllers, services e DTOs isolados, com testes unitários cobrindo happy paths e casos de erro. O uso de repositórios no `shared/repositories` centraliza queries de banco, e o padrão de transação via `DrizzleProvider` está presente nos fluxos críticos.

O projeto suporta três perfis (`ADMIN`, `PERSONAL`, `STUDENT`) com isolamento por tenant via `TenantAccessGuard`. A autenticação usa JWT com refresh token em cookie HttpOnly. Integração com Stripe para assinaturas SaaS, S3 para upload de mídia, Resend para e-mails transacionais.

**Módulos identificados:**
- `auth` — login, registro, refresh, logout, setup/reset password
- `students` — CRUD, notas, planos de treino, stats
- `personals` — perfil, landing page, upload de foto
- `workouts` / `workout-plans` — exercícios, planos de treino, sessões
- `training-schedule` — regras de agendamento, sessões de treino, engine de expansão com cron
- `bookings` — agendamentos com personal (sistema legado em paralelo ao training-schedule)
- `subscriptions` — checkout Stripe, webhook, portal, upgrade, usage
- `admin` — gestão de personals/planos/dashboard
- `support` — contato

### Frontend (Next.js 14 + App Router)

Organização clara por área de acesso: `(auth)`, `painel` (personal), `admin`, `[slug-personal]/(alunos)` (student), `(marketing)`, `(legal)`, `(support)`. Middleware com proteção de rotas por role e token refresh automático. Services como funções puras por domínio, providers de contexto (AuthContext, QueryProvider). Uso de React Query para data fetching, React Hook Form + Zod para formulários.

**Nota geral:** A base é sólida. Os problemas identificados são majoritariamente de polish, segurança de tipos e alguns anti-patterns pontuais — não há problemas arquiteturais graves.

---

## 2. Código Não Utilizado

### 2.1 Arquivos mortos no frontend

**`/home/patrick/Projects/coach-os/frontend/src/components/component-example.tsx`**
Componente de demonstração criado durante setup do shadcn/ui. Não é importado em nenhuma página ou componente real. O `example.tsx` também existe apenas para sustentar esse arquivo.

```tsx
// component-example.tsx — nunca importado em produção
export function ComponentExample() { ... }
```

**Solução:** Remover `/frontend/src/components/component-example.tsx` e `/frontend/src/components/example.tsx`.

---

### 2.2 Arquivos de barril vazios

`/home/patrick/Projects/coach-os/frontend/src/store/index.ts` e `/frontend/src/hooks/index.ts` e `/frontend/src/services/index.ts` contêm apenas `export {};`. Se não forem usados como ponto de entrada, podem ser removidos ou preenchidos.

---

### 2.3 Parâmetro não utilizado em repositório

`/home/patrick/Projects/coach-os/backend/src/shared/repositories/schedule-rules.repository.ts`
O método `findByStudent` recebe `personalId` mas **não o utiliza** no `where`:

```typescript
async findByStudent(studentId: string, personalId: string, tx?: DrizzleDb): Promise<ScheduleRule[]> {
  const db = tx ?? this.drizzle.db;
  return db
    .select()
    .from(scheduleRules)
    .where(
      eq(scheduleRules.studentId, studentId), // personalId nunca usado!
    );
}
```

**Risco:** Brecha de isolamento de tenant — qualquer personal poderia listar regras de um aluno de outro tenant se soubesse o studentId.

---

### 2.4 `hasUnsavedChanges` hardcoded como `true`

`/home/patrick/Projects/coach-os/frontend/src/app/painel/alunos/[id]/_components/student-schedule-planner.tsx` linha 173:

```tsx
const hasUnsavedChanges = true; // always allow saving
```

Variável declarada mas não utilizada para nada (o botão salvar não depende dela). Dead code que indica funcionalidade planejada e não implementada.

---

### 2.5 `to` ignorado em `findByStudentAndDateRange`

`/home/patrick/Projects/coach-os/backend/src/shared/repositories/training-sessions.repository.ts`

O método recebe `to: string` mas **não aplica** o filtro de `lte` no query:

```typescript
async findByStudentAndDateRange(
  studentId: string,
  personalId: string,
  from: string,
  to: string,        // <-- recebido mas ignorado
  tx?: DrizzleDb,
): Promise<TrainingSession[]> {
  ...
  .where(
    and(
      eq(trainingSessions.studentId, studentId),
      eq(trainingSessions.personalId, personalId),
      gte(trainingSessions.scheduledDate, from),
      // falta: lte(trainingSessions.scheduledDate, to)
    ),
  );
}
```

**Risco:** Retorna todas as sessões a partir de `from` até o futuro, ignorando o limite `to`. Isso pode retornar dados excessivos.

---

## 3. Problemas de Qualidade de Código

### 3.1 Uso excessivo de `as any` nos repositórios

Foram encontradas **50 ocorrências** de `as any` nos repositórios do backend. Isso contorna completamente a verificação de tipos do TypeScript, eliminando o benefício principal do uso do Drizzle com tipagem.

Exemplos em `/home/patrick/Projects/coach-os/backend/src/shared/repositories/personals.repository.ts`:

```typescript
const result = await db.insert(personals).values(data as any).returning();
const result = await db.update(personals).set(data as any).where(...).returning();
```

E em `/home/patrick/Projects/coach-os/backend/src/shared/repositories/training-sessions.repository.ts`:

```typescript
return (db as any)
  .insert(trainingSessions)
  .values(data as NewTrainingSession[])
  .onConflictDoNothing()
  .returning();
```

**Causa apontada nos comentários:** Incompatibilidade de tipos no Drizzle v0.39.
**Solução:** Investigar se o problema é de versão do Drizzle ou de tipagem incorreta nos inputs. Onde necessário, criar tipos auxiliares explícitos em vez de silenciar o compilador.

---

### 3.2 `console.log` com dados sensíveis em produção

`/home/patrick/Projects/coach-os/backend/src/shared/providers/s3.provider.ts`:

```typescript
console.log("bucket", this.bucket);
console.log("region", this.region);
console.log("accessKey", env.AWS_ACCESS_KEY_ID);  // EXPOSIÇÃO DE CHAVE!
console.log("secretKey", env.AWS_SECRET_ACCESS_KEY); // EXPOSIÇÃO DE SECRET!
```

**Risco crítico de segurança:** As credenciais AWS são logadas em plaintext a cada geração de URL pré-assinada, expondo-as nos logs de produção.

---

### 3.3 `console.log` de variável de ambiente em serviço de produção

`/home/patrick/Projects/coach-os/backend/src/modules/admin/register/register.service.ts` linha 21:

```typescript
async execute(dto: RegisterServiceInput): Promise<RegisterResponseDTO> {
  console.log(env.CAN_CREATE_ADMIN); // debug esquecido
```

Debug esquecido em código de produção.

---

### 3.4 Defaults inseguros no `env/index.ts`

`/home/patrick/Projects/coach-os/backend/src/config/env/index.ts`:

```typescript
JWT_SECRET: process.env.JWT_SECRET || "jwt_secret_change_in_production",
JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET || "jwt_refresh_secret_change_in_production",
HASH_PEPPER: process.env.HASH_PEPPER || "hash_pepper_change_in_production",
DATABASE_PASSWORD: process.env.DATABASE_PASSWORD || "123",
```

Se as variáveis não forem definidas em produção, o sistema roda com segredos públicos conhecidos. Não há falha rápida (fail-fast) com erro explícito.

**Solução recomendada:** Usar uma biblioteca de validação de env (ex: `zod` ou `envalid`) que lance erro na inicialização se variáveis obrigatórias estiverem ausentes.

---

### 3.5 `decodeAccessTokenPayload` duplicada no frontend

A função `decodeAccessTokenPayload` existe em dois arquivos:
- `/home/patrick/Projects/coach-os/frontend/src/lib/api.ts`
- `/home/patrick/Projects/coach-os/frontend/src/middleware.ts`

Código idêntico copiado nos dois locais. A função no middleware roda no edge runtime onde a lógica é ligeiramente diferente, mas o parsing do JWT é o mesmo.

**Solução:** Extrair para um módulo compartilhado (ex: `lib/jwt.ts`) — verificando a compatibilidade com edge runtime.

---

### 3.6 Inconsistência entre `subscriptionStatus` e `accessStatus`

Em `personals.ts` há dois campos similares:
- `subscriptionStatus` — reflete o estado no Stripe (`active`, `canceled`, `past_due`, etc.)
- `accessStatus` — estado normalizado da plataforma (`trialing`, `active`, `past_due`, `expired`, `canceled`)

No `TenantAccessGuard`, há lógica complexa para sincronizar os dois, com risco de divergência. O webhook Stripe atualiza `subscriptionStatus` mas não sempre `accessStatus`. O guard faz esse update como efeito colateral de uma requisição normal — violação do princípio de responsabilidade única e potencial condição de corrida.

---

### 3.7 Registro de aluno não usa base plan como referência

`/home/patrick/Projects/coach-os/backend/src/modules/auth/contexts/register/register.service.ts`:

```typescript
const basicPlan = activePlans.find((plan) => plan.name.toLowerCase() === "basico") ?? activePlans[0];
```

Busca o plano básico por nome (`"basico"`) — string hardcoded frágil. Se o nome do plano mudar, o registro de novos personals quebra silenciosamente, caindo para `activePlans[0]` (que pode ser qualquer plano).

---


## 4. Oportunidades de Refatoração

### 4.1 Duplicidade entre `BookingsModule` e `TrainingScheduleModule`

O sistema possui **dois mecanismos paralelos** de agendamento:
1. `bookings` — agendamentos via slots de disponibilidade (sistema original)
2. `training-schedule` (schedule_rules + training_sessions) — planejador semanal automatizado

Ambos coexistem e o frontend os acessa de formas diferentes. A presença dos dois sistemas aumenta a complexidade cognitiva, gera dados redundantes e aumenta a superfície de manutenção. O `student-schedule-planner.tsx` usa o novo sistema, mas o `agenda/page.tsx` ainda usa bookings.

**Recomendação:** Definir qual sistema é o canônico a longo prazo e iniciar migração gradual, ou documentar claramente a separação de responsabilidades de cada um.

**Resposta da recomendação** A longo prazo vamos seguir com o traning schedule, ele precisa ter validações de disponibilidade do personal e etc, o bookigns na verdade pode ser só a configuração de hoŕarios de atendimento do personal e disponibilidade, os horários que já tem treinos marcados devem ser bloqueados detalhe isso só para atendimentos presenciais e residencias, para atendimentos de consultoria online não é necessário bloquear pois não tem controle de horário o personal não precisa estar presente nos treinos 

---

### 4.3 Método `upsertScheduleRules` processa regras sequencialmente

`/home/patrick/Projects/coach-os/backend/src/modules/training-schedule/contexts/upsert-schedule-rules/upsert-schedule-rules.service.ts`:

```typescript
for (const day of dto.days) {
  const rule = await this.scheduleRulesRepository.upsert({...});
  await this.scheduleEngineService.syncRule(rule);
  results.push(rule);
}
```

Para 7 dias da semana, isso executa 14 queries sequenciais. Pode ser paralelizado com `Promise.all` na fase de upsert e depois na fase de sync.

---

### 4.4 `ScheduleEngineService.expandRules` carrega todas as regras ativas em memória

`/home/patrick/Projects/coach-os/backend/src/modules/training-schedule/contexts/schedule-engine/schedule-engine.service.ts`:

```typescript
@Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
async expandRules(): Promise<void> {
  const rules = await this.scheduleRulesRepository.findAllActive();
  for (const rule of rules) {
    await this.processRule(rule);  // sequencial
  }
}
```

Com muitos tenants, isso carrega todas as regras em memória e as processa sequencialmente. Para escalar:
1. Processar em batches
2. Paralelizar com `Promise.allSettled`
3. Considerar queue-based processing

---

### 4.5 Cálculo de MRR no `DashboardRepository` usa `updated_at` como proxy de data de assinatura

`/home/patrick/Projects/coach-os/backend/src/shared/repositories/dashboard.repository.ts`:

```sql
LEFT JOIN ${personals} pe ON
  pe.subscription_status = 'active'
  AND DATE_TRUNC('month', pe.updated_at) <= gs.month
```

Usa `updated_at` para determinar quando uma assinatura se tornou ativa — esse campo é atualizado em qualquer update no perfil do personal, não apenas no momento de ativação da assinatura. Isso pode distorcer os dados de MRR do dashboard admin.

**Solução:** Adicionar um campo `subscriptionActivatedAt` ou usar os dados do Stripe como fonte da verdade.

---

### 4.6 `StudentSchedulePlanner` é um componente muito grande

`/home/patrick/Projects/coach-os/frontend/src/app/painel/alunos/[id]/_components/student-schedule-planner.tsx` tem 430 linhas e mistura:
- Lógica de estado do planejador semanal
- Componente da lista de sessões futuras (`UpcomingSessionsList`)
- Constantes de estilo (`SESSION_TYPE_STYLES`, `SESSION_TYPE_LABEL`)
- Helpers de conversão (`rulesToWeekConfig`, `getDefaultWeekConfig`)

**Refatoração sugerida:** Extrair `UpcomingSessionsList` para arquivo próprio e mover constantes/helpers para `_constants.ts` e `_utils.ts`.

---

### 4.7 Página `executar/page.tsx` com 575 linhas

`/home/patrick/Projects/coach-os/frontend/src/app/[slug-personal]/(alunos)/alunos/treinos/[planId]/executar/page.tsx`

Componente monolítico de 575 linhas com múltiplas responsabilidades: timer de descanso, modal de conclusão, navegação de exercícios, controle de sessão, confetti. Candidato a decomposição em componentes menores.

---

## 5. Problemas de Segurança

### 5.1 [CRÍTICO] Credenciais AWS logadas em plaintext

Já documentado em §3.2. Remover imediatamente os `console.log` em `/backend/src/shared/providers/s3.provider.ts`.

---

### 5.2 [ALTO] Defaults inseguros para segredos JWT e pepper

Já documentado em §3.4. Sem validação de env, um deploy esquecido sem `.env` usará segredos públicos conhecidos, comprometendo toda autenticação da plataforma.

---

### 5.3 [ALTO] Isolamento de tenant incompleto em `findByStudent`

Já documentado em §2.3. O `personalId` recebido não é aplicado ao filtro SQL em `ScheduleRulesRepository.findByStudent`. Um atacante que obtiver um `studentId` de outro tenant poderá listar suas regras de treino.

---

### 5.4 [MÉDIO] JWT decodificado no cliente sem verificação de assinatura

`/home/patrick/Projects/coach-os/frontend/src/lib/api.ts` e `middleware.ts` fazem decode manual do JWT usando `atob` para extrair o payload — sem verificar a assinatura. Isso é correto para leitura de claims no cliente (onde a chave secreta não existe), mas há um risco se o código evoluir e começar a confiar nesses dados para decisões de segurança sem validação server-side.

Atualmente as decisões de segurança reais são feitas no backend, mas vale documentar explicitamente que o decode client-side é apenas para UX e não deve ser usado para autorização.

---

### 5.5 [MÉDIO] Webhook Stripe sem verificação de idempotência robusta

`/home/patrick/Projects/coach-os/backend/src/modules/subscriptions/webhook/webhook.service.ts`

O webhook valida a assinatura Stripe corretamente, mas não há proteção contra replay de eventos (Stripe pode reenviar o mesmo evento). Para `checkout.session.completed` e `invoice.paid`, múltiplos processamentos do mesmo evento podem causar inconsistências no estado da assinatura.

**Solução:** Armazenar `event.id` processados em uma tabela de idempotência ou verificar o estado atual antes de atualizar.

---

### 5.6 [BAIXO] Rota de criação de admin protegida apenas por variável de ambiente

`/home/patrick/Projects/coach-os/backend/src/modules/admin/register/register.service.ts`

```typescript
if (!env.CAN_CREATE_ADMIN) {
  throw new ForbiddenException("Não é possível criar administradores");
}
```

A proteção depende de `CAN_CREATE_ADMIN=true` na env. Se essa variável for exposta acidentalmente, qualquer pessoa pode criar um admin. Considerar adicionar uma rota disponível apenas no ambiente de desenvolvimento (`@IsDev` decorator) ou exigir um token de bootstrapping secreto.

---

### 5.7 [BAIXO] Tokens de setup/reset sem limpeza de tokens anteriores

`/home/patrick/Projects/coach-os/backend/src/modules/auth/contexts/forgot-password/forgot-password.service.ts` — ao criar um novo token de redefinição de senha, não é verificado se tokens anteriores válidos do mesmo usuário existem. Isso pode resultar em múltiplos tokens ativos simultaneamente.

**Verificação necessária:** O repositório `PasswordResetTokensRepository` tem método `invalidateByUserId`? Se não, adicionar.

---

## 6. Problemas de Performance

### 6.1 N+1 no `createMany` de bookings

`/home/patrick/Projects/coach-os/backend/src/shared/repositories/bookings.repository.ts`:

```typescript
async createMany(data: CreateBookingInput[], tx?: DrizzleDb): Promise<BookingWithRelations[]> {
  const result = await db.insert(bookings).values(data as any).returning();
  return this.findManyByIds(
    result.map((booking) => booking.id),
    data[0].personalId,
    db,
  );
}
```

Após inserir múltiplos bookings, faz uma segunda query para buscá-los com joins. Isso é OK para casos com poucos registros, mas pode ser ineficiente para inserções maiores. O `findManyByIds` é uma query única com `inArray`, então não é um N+1 clássico, mas é uma query extra desnecessária se o retorno já inclui os dados necessários.

---

### 6.2 TenantAccessGuard faz query ao banco em TODA requisição autenticada

`/home/patrick/Projects/coach-os/backend/src/shared/guards/tenant-access.guard.ts`:

```typescript
const personal = await this.personalsRepository.findById(user.personalId);
```

Toda requisição de PERSONAL ou STUDENT executa `SELECT` na tabela `personals` para verificar o status de acesso. Em alta carga, isso representa uma query extra por request.

**Otimizações possíveis:**
- Incluir `accessStatus` no payload do JWT (requer relogin ao mudar status)
- Usar cache em memória com TTL curto (ex: 60 segundos por `personalId`)
- Atualizar `accessStatus` somente via webhook Stripe, e incluí-lo no token

---

### 6.3 `ScheduleEngineService.expandRules` sem paginação ou processamento em batch

Já documentado em §4.4. Com crescimento da base de personals, o cron job daily pode demorar muito ou consumir muita memória.

---

### 6.4 Query de revenue timeline usa SQL raw desnecessariamente complexo

`/home/patrick/Projects/coach-os/backend/src/shared/repositories/dashboard.repository.ts`

A query de `getRevenueTimeline` usa `generate_series` e LEFT JOIN com `personal.updated_at` para calcular MRR histórico. Além do problema de acurácia (§4.5), a abordagem tem problemas de performance em tabelas grandes pois realiza full scan de `personals` para cada mês gerado pela série.

---

### 6.5 Frontend: `executar/page.tsx` recalcula estado em cada render

`/home/patrick/Projects/coach-os/frontend/src/app/[slug-personal]/(alunos)/alunos/treinos/[planId]/executar/page.tsx`:

```typescript
const mergedProgress = sortedExercises.reduce<Record<string, ExerciseProgressState>>(
  (acc, ex) => {
    acc[ex.id] = exerciseProgress[ex.id] ?? { completedSets: 0 };
    return acc;
  },
  {},
);
```

`mergedProgress`, `totalSets`, `completedSetsTotal`, `progressPercent`, `isExerciseFinished`, `allExercisesDone` são calculados no corpo do componente a cada render sem `useMemo`. Para planos com muitos exercícios, esses recálculos são desnecessários.

---

## 7. Melhorias Recomendadas para Manutenção Futura

### 7.1 Centralizar repositórios em um `SharedModule` global

Criar um `SharedModule` NestJS que declare e exporte todos os repositórios, evitando a declaração repetida em cada módulo. Atualmente, `PersonalsRepository` é declarado em pelo menos 6 módulos diferentes.

---

### 7.2 Validação de variáveis de ambiente na inicialização

Substituir o objeto `env` atual por um schema Zod que valide tipos, formatos e presença de variáveis obrigatórias durante o boot:

```typescript
// Ao invés de:
JWT_SECRET: process.env.JWT_SECRET || "jwt_secret_change_in_production"

// Usar:
const envSchema = z.object({
  JWT_SECRET: z.string().min(32),
  // ...
});
export const env = envSchema.parse(process.env);
```

---

### 7.3 Adicionar índice composto em `training_sessions` para o caso de uso mais comum

A query mais frequente em training_sessions filtra por `studentId + scheduledDate`. O índice `idx_training_sessions_student_id` existe, mas um índice composto `(student_id, scheduled_date)` seria mais eficiente para queries com as duas condições.

---

### 7.4 Definir enum para `role` no banco de dados

Substituir `varchar("role", { length: 50 })` por `pgEnum("user_role", ["PERSONAL", "STUDENT", "ADMIN"])` no schema do Drizzle. Isso garante integridade referencial no nível do banco.

---

### 7.5 Definir enums para status de sessão e subscription

Os campos `status` em `trainingSessions`, `bookings`, `workoutSessions` e `subscriptionStatus`, `accessStatus` em `personals` usam `varchar` com tipos TypeScript anotados via `.$type<>()`. Converter para `pgEnum` garante integridade no banco e facilita migrações.

---

### 7.6 Documentar e unificar os dois sistemas de agendamento

Conforme §4.1, há dois sistemas coexistindo. Criar documentação no `docs/` explicando:
- Quando usar `bookings` vs `training_sessions`
- Roadmap de consolidação ou separação definitiva

---

### 7.7 Adicionar rate limiting nas rotas públicas

Mencionado no `CLAUDE.md` como "não agora, mas no futuro". As rotas `/auth/login`, `/auth/register`, `/auth/forgot-password` e o webhook Stripe são candidatos prioritários para rate limiting.

---

### 7.8 Implementar token de idempotência para o webhook Stripe

Conforme §5.5, armazenar `event.id` do Stripe e rejeitar duplicatas.

---

## 8. Quick Wins

Melhorias de baixo esforço e alto impacto que podem ser aplicadas imediatamente:

| # | Arquivo | Ação |
|---|---------|------|
| 1 | `s3.provider.ts` | **URGENTE**: Remover `console.log` com credenciais AWS (linhas 37-40) |
| 2 | `admin/register/register.service.ts` | Remover `console.log(env.CAN_CREATE_ADMIN)` (linha 21) |
| 3 | `training-sessions.repository.ts` | Adicionar filtro `lte(scheduledDate, to)` no método `findByStudentAndDateRange` |
| 4 | `schedule-rules.repository.ts` | Adicionar `eq(scheduleRules.personalId, personalId)` no `findByStudent` |
| 5 | `frontend/components/component-example.tsx` | Remover arquivo (e `example.tsx`) — não usado em produção |
| 6 | `frontend/store/index.ts` | Remover arquivo vazio ou popular com conteúdo real |
| 7 | `student-schedule-planner.tsx` linha 173 | Remover `const hasUnsavedChanges = true` não utilizado |
| 8 | `env/index.ts` | Adicionar validação Zod para evitar defaults inseguros em produção |
| 9 | `executar/page.tsx` | Envolver `mergedProgress`, `totalSets`, `allExercisesDone` em `useMemo` |
| 10 | `training-sessions.repository.ts` | Adicionar índice composto `(student_id, scheduled_date)` na migration |

---

## 9. Avaliação Geral

### Pontos Fortes

- Arquitetura modular bem organizada e consistente (Vertical Slice)
- Isolamento por tenant implementado corretamente na maioria dos fluxos
- Testes unitários presentes em quase todos os serviços (boa cobertura de happy/error paths)
- Middleware de autenticação sólido com refresh token e proteção de rotas por role
- Schema de banco bem indexado na maior parte dos casos
- Integração Stripe com validação de assinatura por webhook
- Uso correto de argon2id para hashing de senha com pepper

### Pontos de Atenção

- `as any` generalizado nos repositórios elimina os benefícios do TypeScript
- Credenciais AWS em `console.log` — risco crítico de segurança imediato
- Defaults inseguros para segredos em `env/index.ts`
- Brecha de isolamento de tenant no `ScheduleRulesRepository.findByStudent`
- Bug no `findByStudentAndDateRange` (parâmetro `to` ignorado)
- Dois sistemas de agendamento paralelos aumentam complexidade

### Nota Técnica

| Dimensão | Nota |
|----------|------|
| Arquitetura | 8/10 |
| Qualidade de código | 6/10 |
| Segurança | 6/10 |
| Performance | 7/10 |
| Testabilidade | 8/10 |
| Manutenibilidade | 7/10 |
| **Geral** | **7/10** |

O projeto está em bom estado para uma plataforma em desenvolvimento. Os problemas mais críticos são os `console.log` com credenciais AWS e os defaults inseguros de segredos JWT — ambos facilmente corrigíveis. O restante dos problemas são melhorias incrementais que não comprometem o funcionamento atual, mas devem ser endereçados antes de escalar a base de usuários.
