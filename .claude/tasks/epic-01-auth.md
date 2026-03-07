# Epic 01 — Autenticacao e Fundacao

Status: `[x]` done

> **Revisao aplicada:** ver [architectural-review.md](architectural-review.md)
> US-006 (Login do Aluno) foi absorvida por US-002. Um unico endpoint de login atende todos os roles.

---

## PRE-REQUISITO — Reinicio do Schema

**Status:** `[x]` done

### Subtasks
- [x] Deletar todos os arquivos em `src/config/database/migrations/`
- [x] Reescrever `src/config/database/schema/users.ts` — relacoes atualizadas (personal, student, admin)
- [x] Reescrever `src/config/database/schema/personals.ts` — relacoes atualizadas
- [x] Reescrever `src/config/database/schema/students.ts` — removido name/email/password; adicionado `userId` (FK unico)
- [x] Criar `src/config/database/schema/admins.ts` — nova tabela com `id`, `userId`
- [x] Reescrever `src/config/database/schema/workout.ts` — adicionado references() e relations()
- [x] Reescrever `src/config/database/schema/availability.ts` — adicionado references() e relations()
- [x] Reescrever `src/config/database/schema/plans.ts` — `benefits` migrado de varchar para `json`
- [x] Atualizar `src/config/database/schema/index.ts` para exportar `admins`
- [x] Instalar `argon2` (substituindo bcrypt do seed)
- [x] Atualizar `src/config/env/index.ts` — adicionado JWT_REFRESH_SECRET e JWT_REFRESH_EXPIRATION
- [x] Rodar `drizzle-kit generate` — migration `0000_regular_legion.sql` gerada (12 tabelas, FK constraints reais)
- [x] Rodar `db:migrate` — aplicada com sucesso no banco limpo
- [x] Atualizar `seed.ts` — admin via users+admins, student via users+students, argon2 hash, benefits como array
- [x] Rodar `db:seed` — 3 users, 1 personal, 1 student, 1 admin, 3 planos SaaS, 50 exercicios globais
- [x] Atualizar `src/shared/interfaces/accessToken.interface.ts` — sub, role, profileId, personalId, personalSlug

---

## US-001 — Registro de Personal Trainer

**Status:** `[x]` done
**Sprint:** 1
**Dependencias:** PRE-REQUISITO (schema)

**Descricao:**
Como profissional de educacao fisica, quero me registrar na plataforma para criar minha conta e comecar a usar o sistema.

### Criterios de Aceite
- [x] Campos: nome, e-mail, senha, confirmacao de senha
- [x] E-mail unico na tabela `users`
- [x] Senha com minimo 8 caracteres
- [x] Criacao atomica (transaction): `users` + `personals` (slug gerado do nome)
- [x] Slug unico; se conflito, adicionar sufixo numerico (ex: `joao-silva-2`)
- [x] Role definida como `PERSONAL` automaticamente
- [x] Retorna 201 com dados do usuario e perfil (sem senha)

### Diretivas de Implementacao
- Modulo: `src/modules/auth/`
- Context: `register/`
- TDD: escrever testes antes da implementacao
- Hash com `argon2id` — instalar `argon2` package and pepper env var (HASH_PEPPER)
- Remover `bcrypt` do projeto se existir

### Subtasks Backend
- [x] `POST /auth/register` — controller, service, request DTO, response DTO
- [x] `UsersRepository.create(data)` — insere em `users`
- [x] `PersonalsRepository.create(data)` — insere em `personals`
- [x] Funcao `generateUniqueSlug(name, db)` em `shared/utils/`
- [x] Transaction englobando criacao de `users` + `personals`
- [x] `register.controller.spec.ts` (happy path + email duplicado + senha fraca)
- [x] `register.service.spec.ts` (happy path + erro de slug + erro de db)

### Subtasks Frontend
- [x] Rota: `/cadastro` (equivalente a `/register`)
- [x] Formulario com React Hook Form + Zod
- [x] Campos: nome, e-mail, senha, confirmacao de senha
- [x] Validacao de senha: minimo 8 caracteres, senha === confirmacao
- [x] Toggle show/hide senha
- [x] Exibir erros por campo (resposta 400 da API)
- [x] Redirect para `/painel` apos sucesso (equivalente a `/dashboard`)

### Notas Tecnicas
- O slug e gerado automaticamente no backend (nao e input do usuario)
- Algoritmo de slug: `name.toLowerCase().replace(/\s+/g, '-').normalize('NFKD').replace(/[^\w-]/g, '')`
- Para garantir unicidade: checar no banco antes de inserir, se existe adicionar sufixo `-2`, `-3`, etc.

---

## US-002 — Login Unificado (Personal, Student e Admin)

**Status:** `[x]` done
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
- [x] Instalar: `@nestjs/passport`, `passport`, `passport-local`, `passport-jwt`, `@nestjs/jwt`, `argon2`
- [x] `POST /auth/login` — controller + service + DTOs
- [x] `POST /auth/refresh` — renovar `accessToken` via `refreshToken` do cookie
- [x] `POST /auth/logout` — limpar cookie do `refreshToken`
- [x] `LocalStrategy` — busca user em `users` por email, verifica senha com argon2
- [x] `JwtStrategy` — valida token e popula `request.user` com `IAccessToken` completo
  - Para PERSONAL: faz JOIN com `personals` para pegar `profileId` e `personalId`
  - Para STUDENT: faz JOIN com `students` e `personals` para pegar `profileId` e `personalId` do tenant
  - Para ADMIN: faz JOIN com `admins` para pegar `profileId`
- [x] `AuthModule` exportando strategies, registrado no `app.module.ts`
- [x] `login.controller.spec.ts` (happy path personal, student, admin + 401 + 403)
- [x] `login.service.spec.ts`
- [x] `refresh.controller.spec.ts` + `refresh.service.spec.ts`

### Subtasks Frontend
- [x] Rota: `/login`
- [x] Formulario com React Hook Form + Zod
- [x] `AuthProvider` (`src/providers/auth.provider.tsx`) com estado: `user`, `isAuthenticated`, `login`, `logout`
- [x] Armazenar `accessToken` em memoria (nao localStorage — evita XSS)
- [x] `refreshToken` gerenciado automaticamente via cookie (httpOnly)
- [x] `middleware.ts` — proteger rotas por role:
  - `/painel/*` → requer PERSONAL
  - `/{slug}/alunos/*` → requer STUDENT
  - `/admin/*` → requer ADMIN
- [x] Interceptor Axios para renovar `accessToken` automaticamente (401 → refresh → retry)
- [x] Redirect pos-login por role

### Notas Tecnicas
- `JWTAuthGuard` e `RolesGuard` ja existem e funcionam — o `AuthModule` so precisa registrar as strategies Passport
- O `personalSlug` pode nao estar no JWT — o middleware pode buscar do perfil apos login para montar o redirect do student
- Alternativamente, incluir `personalSlug` no JWT do STUDENT para evitar query adicional (recomendado)
- accessToken em memoria: usar `useRef` ou context — limpo ao fechar o browser (refresh token reautentica automaticamente)

---

## ~~US-006 — Login do Aluno~~ (REMOVIDA)

> **Absorvida por US-002.** O endpoint `POST /auth/login` unificado trata todos os roles, incluindo STUDENT.
> Nao ha trabalho separado para esta US.
