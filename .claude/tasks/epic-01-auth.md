# Epic 01 — Autenticacao e Fundacao

Status: `[ ]` todo

> **Revisao aplicada:** ver [architectural-review.md](architectural-review.md)
> US-006 (Login do Aluno) foi absorvida por US-002. Um unico endpoint de login atende todos os roles.

---

## PRE-REQUISITO — Reinicio do Schema

**Status:** `[ ]` todo
**Deve ser feito antes de qualquer US deste epic**

### Subtasks
- [ ] Deletar todos os arquivos em `src/config/database/migrations/` e `meta/`
- [ ] Reescrever `src/config/database/schema/users.ts` (sem mudancas estruturais, confirmar campos)
- [ ] Reescrever `src/config/database/schema/personals.ts` (sem mudancas)
- [ ] Reescrever `src/config/database/schema/students.ts` — remover `name`, `email`, `password`; adicionar `userId` (FK unico para `users.id`)
- [ ] Criar `src/config/database/schema/admins.ts` — tabela nova com `id`, `userId` (FK unico)
- [ ] Atualizar `src/config/database/schema/index.ts` para exportar `admins`
- [ ] Rodar `drizzle-kit generate` para gerar migration limpa
- [ ] Rodar `drizzle-kit migrate` para aplicar
- [ ] Atualizar `seed.ts`:
  - [ ] Criar admin via `users` + `admins`
  - [ ] Criar student via `users` + `students` (sem email/password proprios na tabela students)
- [ ] Atualizar `src/shared/interfaces/accessToken.interface.ts`:
  ```typescript
  export interface IAccessToken {
    sub: string;           // users.id
    role: ApplicationRoles;
    profileId: string;     // personals.id | students.id | admins.id
    personalId: string | null; // tenant context (null para ADMIN)
  }
  ```

---

## US-001 — Registro de Personal Trainer

**Status:** `[ ]` todo
**Sprint:** 1
**Dependencias:** PRE-REQUISITO (schema)

**Descricao:**
Como profissional de educacao fisica, quero me registrar na plataforma para criar minha conta e comecar a usar o sistema.

### Criterios de Aceite
- [ ] Campos: nome, e-mail, senha, confirmacao de senha
- [ ] E-mail unico na tabela `users`
- [ ] Senha com minimo 8 caracteres
- [ ] Criacao atomica (transaction): `users` + `personals` (slug gerado do nome)
- [ ] Slug unico; se conflito, adicionar sufixo numerico (ex: `joao-silva-2`)
- [ ] Role definida como `PERSONAL` automaticamente
- [ ] Retorna 201 com dados do usuario e perfil (sem senha)

### Diretivas de Implementacao
- Modulo: `src/modules/auth/`
- Context: `register/`
- TDD: escrever testes antes da implementacao
- Hash com `argon2id` — instalar `argon2` package
- Remover `bcrypt` do projeto se existir

### Subtasks Backend
- [ ] `POST /auth/register` — controller, service, request DTO, response DTO
- [ ] `UsersRepository.create(data)` — insere em `users`
- [ ] `PersonalsRepository.create(data)` — insere em `personals`
- [ ] Funcao `generateUniqueSlug(name, db)` em `shared/utils/`
- [ ] Transaction englobando criacao de `users` + `personals`
- [ ] `register.controller.spec.ts` (happy path + email duplicado + senha fraca)
- [ ] `register.service.spec.ts` (happy path + erro de slug + erro de db)

### Subtasks Frontend
- [ ] Rota: `/register`
- [ ] Formulario com React Hook Form + Zod
- [ ] Campos: nome, e-mail, senha, confirmacao de senha
- [ ] Validacao de senha: minimo 8 caracteres, senha === confirmacao
- [ ] Toggle show/hide senha
- [ ] Exibir erros por campo (resposta 400 da API)
- [ ] Redirect para `/dashboard` apos sucesso

### Notas Tecnicas
- O slug e gerado automaticamente no backend (nao e input do usuario)
- Algoritmo de slug: `name.toLowerCase().replace(/\s+/g, '-').normalize('NFKD').replace(/[^\w-]/g, '')`
- Para garantir unicidade: checar no banco antes de inserir, se existe adicionar sufixo `-2`, `-3`, etc.

---

## US-002 — Login Unificado (Personal, Student e Admin)

**Status:** `[ ]` todo
**Sprint:** 1
**Dependencias:** US-001

**Descricao:**
Como usuario cadastrado (personal, student ou admin), quero fazer login na plataforma com e-mail e senha para acessar minha area restrita.

### Criterios de Aceite
- [ ] Um unico endpoint `POST /auth/login` para todos os roles
- [ ] Autenticacao via e-mail + senha (verificado na tabela `users`)
- [ ] Retorna `accessToken` (JWT, 15 min) e `refreshToken` (JWT, 7 dias, cookie httpOnly)
- [ ] JWT payload por role:
  - PERSONAL: `{ sub, role, profileId: personals.id, personalId: personals.id }`
  - STUDENT:  `{ sub, role, profileId: students.id, personalId: personals.id }` (personalId do coach)
  - ADMIN:    `{ sub, role, profileId: admins.id, personalId: null }`
- [ ] Credenciais invalidas → 401 com mensagem generica (nunca revelar qual campo esta errado)
- [ ] Conta inativa → 403
- [ ] Redirect no frontend por role:
  - PERSONAL → `/dashboard`
  - STUDENT  → `/{personal-slug}/students/dashboard`
  - ADMIN    → `/admin`

### Diretivas de Implementacao
- Contexts: `login/`, `refresh/`, `logout/`
- Passport.js: `LocalStrategy` (valida email/password) + `JwtStrategy` (valida token nas rotas protegidas)
- Refresh token armazenado em cookie `httpOnly; SameSite=Strict; Secure`
- Rotas de login e register usam `@Public()` (ja existe em `shared/decorators/`)

### Subtasks Backend
- [ ] Instalar: `@nestjs/passport`, `passport`, `passport-local`, `passport-jwt`, `@nestjs/jwt`, `argon2`
- [ ] `POST /auth/login` — controller + service + DTOs
- [ ] `POST /auth/refresh` — renovar `accessToken` via `refreshToken` do cookie
- [ ] `POST /auth/logout` — limpar cookie do `refreshToken`
- [ ] `LocalStrategy` — busca user em `users` por email, verifica senha com argon2
- [ ] `JwtStrategy` — valida token e popula `request.user` com `IAccessToken` completo
  - Para PERSONAL: faz JOIN com `personals` para pegar `profileId` e `personalId`
  - Para STUDENT: faz JOIN com `students` e `personals` para pegar `profileId` e `personalId` do tenant
  - Para ADMIN: faz JOIN com `admins` para pegar `profileId`
- [ ] `AuthModule` exportando strategies, registrado no `app.module.ts`
- [ ] `login.controller.spec.ts` (happy path personal, student, admin + 401 + 403)
- [ ] `login.service.spec.ts`
- [ ] `refresh.controller.spec.ts` + `refresh.service.spec.ts`

### Subtasks Frontend
- [ ] Rota: `/login`
- [ ] Formulario com React Hook Form + Zod
- [ ] `AuthProvider` (`src/providers/auth.provider.tsx`) com estado: `user`, `isAuthenticated`, `login`, `logout`
- [ ] Armazenar `accessToken` em memoria (nao localStorage — evita XSS)
- [ ] `refreshToken` gerenciado automaticamente via cookie (httpOnly)
- [ ] `middleware.ts` — proteger rotas por role:
  - `/dashboard/*` → requer PERSONAL
  - `/{slug}/students/*` → requer STUDENT
  - `/admin/*` → requer ADMIN
- [ ] Interceptor Axios para renovar `accessToken` automaticamente (401 → refresh → retry)
- [ ] Redirect pos-login por role

### Notas Tecnicas
- `JWTAuthGuard` e `RolesGuard` ja existem e funcionam — o `AuthModule` so precisa registrar as strategies Passport
- O `personalSlug` pode nao estar no JWT — o middleware pode buscar do perfil apos login para montar o redirect do student
- Alternativamente, incluir `personalSlug` no JWT do STUDENT para evitar query adicional (recomendado)
- accessToken em memoria: usar `useRef` ou context — limpo ao fechar o browser (refresh token reautentica automaticamente)

---

## ~~US-006 — Login do Aluno~~ (REMOVIDA)

> **Absorvida por US-002.** O endpoint `POST /auth/login` unificado trata todos os roles, incluindo STUDENT.
> Nao ha trabalho separado para esta US.
