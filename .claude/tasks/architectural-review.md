# Revisao Arquitetural — Minerva & Dumbledore

**Data:** 2026-03-05
**Status:** Aprovado — aplicar antes de qualquer implementacao

---

## Contexto

Antes do inicio da implementacao, Minerva (produto) e Dumbledore (arquitetura) conduziram uma revisao critica do plano atual. Dois problemas estruturais foram identificados que, se nao corrigidos agora, causarao retrabalho significativo durante o desenvolvimento e riscos de seguranca na producao.

---

## Problema 1 — Modelo de Autenticacao Duplicado

### O que esta errado

O schema atual mantem duas entidades de autenticacao distintas:

```
users       → personal, admin (tem email + password)
students    → student (tem email + password proprios)
```

Isso cria dois pipelines de autenticacao paralelos:
- `POST /auth/login` para personals/admins
- `POST /auth/student/login` para students (proposto em US-006)

**Riscos identificados:**
- Duplicacao de logica de hash de senha (argon2id em dois lugares)
- Dois fluxos de geracao de JWT
- Inconsistencia na renovacao de tokens
- Testes duplicados para a mesma responsabilidade
- Impossibilidade de compartilhar um mesmo e-mail entre roles sem colisao

### Decisao Arquitetural: Usuario Unificado

Toda autenticacao passa por uma unica tabela `users`. Os dados especificos de cada role ficam em subtabelas separadas.

```
users
  id, email, password, name, isActive, role, createdAt, updatedAt

personals
  id, userId (FK unico), slug, bio, themeColor, lp_fields...

students
  id, userId (FK unico), personalId (tenant FK)

admins
  id, userId (FK unico)
```

**Beneficios:**
- Um unico endpoint `POST /auth/login` para todos os roles
- Logica de hash/verificacao de senha em um unico lugar
- Um unico fluxo de JWT
- `IAccessToken` uniforme com contexto de tenant embutido
- Criacao de student = criar `users` + `students` (atomico)

---

## Problema 2 — Isolamento Multi-Tenant Indefinido

### O que esta errado

O plano atual menciona `personalId` como identificador de tenant, mas nao define:
- Como o `personalId` chega nos repositories
- Quem e responsavel por extrair o tenant context da requisicao
- Como impedir que um personal acesse dados de outro personal
- O que acontece quando o `personalId` na rota nao bate com o do JWT

O `IAccessToken` atual tem apenas `{ id, name, email, role }` — sem nenhum contexto de tenant.

### Decisao Arquitetural: Tenant no JWT + Enforcing na Camada de Repository

#### 1. JWT Payload Enriquecido

O JWT passa a carregar o contexto de tenant necessario para cada role:

```typescript
// PERSONAL
{
  sub: "userId",
  role: "PERSONAL",
  profileId: "personals.id",   // ID do perfil do personal
  personalId: "personals.id",  // ID do tenant (mesmo valor que profileId)
}

// STUDENT
{
  sub: "userId",
  role: "STUDENT",
  profileId: "students.id",    // ID do perfil do student
  personalId: "personals.id",  // ID do tenant (o personal ao qual pertence)
}

// ADMIN
{
  sub: "userId",
  role: "ADMIN",
  profileId: "admins.id",      // ID do perfil do admin
  personalId: null,            // Admin nao tem tenant — acessa tudo
}
```

A regra e simples: `personalId` no JWT **sempre representa o tenant**. Para PERSONAL, e o proprio ID de perfil. Para STUDENT, e o ID do seu coach.

#### 2. Interface IAccessToken Atualizada

```typescript
// src/shared/interfaces/accessToken.interface.ts
export interface IAccessToken {
  sub: string;           // users.id
  role: ApplicationRoles;
  profileId: string;     // personals.id | students.id | admins.id
  personalId: string | null; // tenant context (null apenas para ADMIN)
}
```

#### 3. Regra de Ouro dos Repositories

**Todo repository que acessa dados com escopo de tenant DEVE receber `tenantId` como parametro e incluir o filtro em TODAS as queries.**

```typescript
// Correto
class StudentsRepository {
  findAll(tenantId: string, pagination: PaginationDto) {
    return this.db
      .select()
      .from(students)
      .where(eq(students.personalId, tenantId)) // sempre
      .limit(pagination.size)
      .offset(pagination.page * pagination.size);
  }

  findById(id: string, tenantId: string) {
    return this.db
      .select()
      .from(students)
      .where(
        and(
          eq(students.id, id),
          eq(students.personalId, tenantId) // nunca omitir
        )
      )
      .limit(1);
  }
}

// Errado — abre brecha para IDOR
class StudentsRepository {
  findById(id: string) {
    return this.db.select().from(students).where(eq(students.id, id));
  }
}
```

#### 4. Regra de Ouro dos Services

**O `tenantId` NUNCA vem de parametros de rota ou body. Sempre vem do JWT (`currentUser.personalId`).**

```typescript
// Correto
class GetStudentService {
  execute(studentId: string, currentUser: IAccessToken) {
    return this.studentsRepository.findById(studentId, currentUser.personalId);
  }
}

// Errado — IDOR: qualquer personal pode acessar qualquer student
class GetStudentService {
  execute(studentId: string, tenantId: string) { // tenantId veio do body/params
    return this.studentsRepository.findById(studentId, tenantId);
  }
}
```

#### 5. Sem TenantGuard Separado

Nao e necessario um guard adicional de tenant. O isolamento e garantido pela combinacao:
- JWT Guard valida o token
- Roles Guard valida o role
- Repository SEMPRE filtra por `tenantId` extraido do JWT

Tentativas de IDOR (acessar `/students/id-de-outro-tenant`) resultam em 404 (nao encontrado), nao em 403 — ocultando a existencia do recurso.

---

## Schema Final Proposto

### Reinicio do Schema (do zero)

Como nenhuma migration foi executada em producao, o schema sera reescrito completamente. Deletar todas as migrations existentes e comecar com uma migration limpa.

### users
```typescript
export const users = pgTable("users", {
  id: varchar("id", { length: 36 }).primaryKey().$defaultFn(() => randomUUID()),
  name: varchar("name", { length: 150 }).notNull(),
  email: varchar("email", { length: 150 }).notNull().unique(),
  password: varchar("password", { length: 255 }).notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  role: varchar("role", { length: 50 }).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
}, (table) => [
  uniqueIndex("user_email_idx").on(table.email),
  index("users_role_idx").on(table.role),
]);
```

### personals
```typescript
export const personals = pgTable("personals", {
  id: varchar("id", { length: 36 }).primaryKey().$defaultFn(() => randomUUID()),
  userId: varchar("user_id", { length: 36 }).notNull().unique(),
  slug: varchar("slug", { length: 255 }).notNull().unique(),
  bio: text("bio"),
  profilePhoto: varchar("profile_photo", { length: 500 }),
  themeColor: varchar("theme_color", { length: 7 }).notNull().default("#10b981"),
  phoneNumber: varchar("phone_number", { length: 20 }),
  lpTitle: varchar("lp_title", { length: 255 }),
  lpSubtitle: varchar("lp_subtitle", { length: 255 }),
  lpHeroImage: varchar("lp_hero_image", { length: 500 }),
  lpAboutTitle: varchar("lp_about_title", { length: 255 }),
  lpAboutText: text("lp_about_text"),
  lpImage1: varchar("lp_image1", { length: 500 }),
  lpImage2: varchar("lp_image2", { length: 500 }),
  lpImage3: varchar("lp_image3", { length: 500 }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
}, (table) => [
  uniqueIndex("personals_slug_idx").on(table.slug),
  uniqueIndex("personals_user_id_idx").on(table.userId),
]);
```

### students (ALTERADO — sem name/email/password proprios)
```typescript
export const students = pgTable("students", {
  id: varchar("id", { length: 36 }).primaryKey().$defaultFn(() => randomUUID()),
  userId: varchar("user_id", { length: 36 }).notNull().unique(), // FK -> users.id
  personalId: varchar("personal_id", { length: 36 }).notNull(),  // tenant FK -> personals.id
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
}, (table) => [
  uniqueIndex("students_user_id_idx").on(table.userId),
  index("students_personal_id_idx").on(table.personalId),
]);

// Nota: name e email do aluno vem do JOIN com users
// name de exibicao: users.name
// email: users.email
// um usuario so pode ser aluno de UM personal (userId unico em students)
```

### admins (NOVO)
```typescript
export const admins = pgTable("admins", {
  id: varchar("id", { length: 36 }).primaryKey().$defaultFn(() => randomUUID()),
  userId: varchar("user_id", { length: 36 }).notNull().unique(), // FK -> users.id
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
}, (table) => [
  uniqueIndex("admins_user_id_idx").on(table.userId),
]);
```

### Tabelas sem alteracao significativa
- `exercises` — sem mudancas
- `workout_plans` — sem mudancas (usa `personalId` como tenant)
- `workout_plan_students` — sem mudancas (usa `studentId` FK para students.id)
- `workout_exercises` — sem mudancas
- `availability_slots` — sem mudancas
- `service_plans` — sem mudancas
- `bookings` — sem mudancas
- `plans` (SaaS) — sem mudancas

---

## Fluxo de Autenticacao Unificado

### Login (todos os roles)

```
POST /auth/login
Body: { email: string, password: string }

1. Buscar user em `users` WHERE email = $email
2. Se nao encontrado → 401 (mensagem generica)
3. Verificar password (argon2id.verify)
4. Se invalido → 401 (mensagem generica)
5. Se !isActive → 403
6. Switch role:
   PERSONAL → buscar personals WHERE userId = user.id
               → JWT: { sub, role, profileId: personal.id, personalId: personal.id }
   STUDENT  → buscar students JOIN personals WHERE students.userId = user.id
               → JWT: { sub, role, profileId: student.id, personalId: personal.id }
   ADMIN    → buscar admins WHERE userId = user.id
               → JWT: { sub, role, profileId: admin.id, personalId: null }
7. Gerar accessToken (15min) + refreshToken (7d, httpOnly cookie)
8. Retornar { accessToken, user: { id, name, email, role } }
```

### Registro de Personal

```
POST /auth/register
Body: { name, email, password, confirmPassword }

Transaction:
  1. Verificar unicidade do email
  2. Hash da senha (argon2id)
  3. INSERT users (role: PERSONAL)
  4. Gerar slug a partir do nome (unico)
  5. INSERT personals (userId, slug, themeColor default)
  6. Retornar { user, personal }
```

### Criacao de Student pelo Personal

```
POST /students
Auth: JWT (PERSONAL)
Body: { name, email, temporaryPassword }

Transaction:
  1. Verificar se email ja existe em users
  2. Hash da senha temporaria (argon2id)
  3. INSERT users (role: STUDENT)
  4. INSERT students (userId, personalId: currentUser.personalId)
  5. Enviar e-mail de boas-vindas (Resend)
  6. Retornar dados do student + user (sem senha)
```

---

## Impacto nas User Stories

### US-001 — Registro de Personal (sem mudancas conceituais)
- Implementacao ja era criar `users` + `personals` em transacao
- Confirmar uso de argon2id

### US-002 — Login (SIMPLIFICADO)
- Um unico endpoint para todos os roles
- JWT agora carrega `profileId` e `personalId`
- Elimina a necessidade de US-006 como endpoint separado

### US-005 — Criacao de Student (ALTERADO)
- Criar student = criar `users` + `students` em transacao
- Body agora inclui `name` e `temporaryPassword` (email vira de `users`)
- O campo de busca/exibicao de nome do aluno vem do JOIN com `users`

### US-006 — Login do Aluno (REMOVIDA como US separada)
- Absorvida por US-002 (mesmo endpoint `/auth/login`)
- Nao e mais necessaria como trabalho separado

### Todos os Repositories com escopo de tenant
- Assinatura DEVE incluir `tenantId: string`
- Queries DEVEM incluir `WHERE personalId = tenantId`
- Documentado nas subtasks de cada epic

---

## Checklist Pre-Implementacao

Antes de comecar qualquer modulo, executar:

### Schema
- [ ] Deletar todos os arquivos em `src/config/database/migrations/`
- [ ] Reescrever os arquivos de schema (users, personals, students, admins, workout, availability, plans)
- [ ] Rodar `drizzle-kit generate` para gerar migration limpa
- [ ] Rodar `drizzle-kit migrate` para aplicar
- [ ] Atualizar `seed.ts` para o novo modelo (users → students via userId)

### Shared
- [ ] Atualizar `IAccessToken` com os novos campos (`sub`, `profileId`, `personalId`)
- [ ] Atualizar `@CurrentUser()` se necessario (ja funciona, so a interface muda)
- [ ] `JWTAuthGuard` e `RolesGuard` nao precisam de mudancas (ja funcionam)

### Auth
- [ ] Criar `AuthModule` com Passport local + JWT strategies
- [ ] Estrategia local consulta apenas a tabela `users`
- [ ] Estrategia JWT popula `request.user` com `IAccessToken` completo

---

## Riscos Mitigados por essa Revisao

| Risco | Antes | Depois |
|-------|-------|--------|
| IDOR entre tenants | Sem enforcing definido | Repository sempre filtra por tenantId |
| Dois pipelines de auth | Duplicacao de logica JWT | Um endpoint, um pipeline |
| Student sem contexto de tenant no JWT | Sem personalId no token | personalId sempre presente |
| Cross-tenant via params de rota | Sem protecao | tenantId vem do JWT, nao da rota |
| Hash de senha duplicado | bcrypt em dois lugares | argon2id em um unico lugar |
