# Epic 03 — Gestao de Alunos

Status: `[x]` done

---

> **Revisao aplicada:** ver [architectural-review.md](architectural-review.md)
> A tabela `students` nao tem mais `name`, `email`, `password` proprios.
> Criar student = criar `users` + `students` em transacao.
> Isolamento de tenant via `personalId` extraido do JWT em todos os repositories.

> **Revisao de seguranca (Sprint 2):**
> O personal NAO define senha para o aluno.
> O sistema gera um token de convite e envia um e-mail com link para o aluno
> definir sua propria senha. O campo `temporaryPassword` foi removido do fluxo.
> Referencia: OWASP — nunca expor credenciais geradas por terceiros.

---

## US-005 — Personal cadastra um aluno

**Status:** `[x]` done
**Sprint:** 2
**Dependencias:** US-002

**Descricao:**
Como personal trainer, quero cadastrar um novo aluno para gerenciar seus treinos e agenda.
O aluno recebera um e-mail com um link para ele mesmo definir sua senha de acesso.

### Criterios de Aceite
- [ ] Campos de entrada: nome, e-mail (sem campo de senha — o aluno define a propria)
- [ ] E-mail unico na tabela `users` (nao pode existir outro user com o mesmo email)
- [ ] Criacao atomica (transaction): INSERT em `users` (role: STUDENT, password: null) + INSERT em `students` (userId, personalId) + INSERT em `password_setup_tokens`
- [ ] Aluno recebe e-mail de convite via Resend com botao "Definir minha senha" (link com token)
- [ ] Retorna dados do aluno criado: `{ studentId, userId, name, email, personalId, createdAt }` (sem senha)
- [ ] Personal so pode ver e criar alunos vinculados ao seu `personalId` (tenant isolation)
- [ ] Listar alunos com paginacao e busca por nome ou e-mail
- [ ] Desativar aluno (soft delete: `users.isActive = false`)

### Diretivas de Implementacao
- Modulo: `src/modules/students/`
- Contexts: `create-student/`, `list-students/`, `get-student/`, `update-student/`, `deactivate-student/`
- **Tenant isolation:** `tenantId = currentUser.personalId` — todos os repositories filtram por `students.personalId = tenantId`
- Resend API em `shared/providers/resend.provider.ts`
- **tenantId NUNCA vem de query params ou body — sempre do JWT**
- Token de convite gerado em `shared/utils/token.util.ts` com `crypto.randomBytes(32).toString('hex')`
- Token armazenado com hash (sha256) na tabela `password_setup_tokens`

### Subtasks Backend
- [x] Schema Drizzle: tabela `password_setup_tokens`
  - Campos: `id`, `userId` (FK users), `tokenHash` (varchar 64, unique), `expiresAt` (timestamp), `usedAt` (timestamp nullable), `createdAt`
  - Index em `tokenHash` e `userId`
- [x] Migration Drizzle para `password_setup_tokens`
- [x] `PasswordSetupTokensRepository`:
  - `create(userId, tokenHash, expiresAt)` — insere novo token
  - `findValidByTokenHash(hash)` — busca token valido (nao expirado, nao usado)
  - `markAsUsed(id)` — seta `usedAt = now()`
- [x] `POST /students` — criar aluno
  - Body: `{ name: string, email: string }`
  - Transaction: INSERT users (role STUDENT, password null) + INSERT students (userId, personalId) + INSERT password_setup_tokens (token valido por 48h)
  - Apos commit: enviar e-mail de convite com link `/{personal.slug}/set-password?token={rawToken}`
- [x] `GET /students?page=&size=&search=` — listar alunos do tenant autenticado (paginado)
  - Query com JOIN em `users` para pegar name e email
  - Response formato padrao: `{ content, page, size, totalElements, totalPages }`
- [x] `GET /students/:id` — buscar aluno por ID
  - Repository: `WHERE students.id = $id AND students.personalId = $tenantId`
  - Se nao encontrado (incluindo cross-tenant) → 404
- [x] `PATCH /students/:id` — atualizar dados do aluno
  - Campos editaveis: `name` (em users), `email` (em users)
  - Validar tenant antes de atualizar
- [x] `DELETE /students/:id` — desativar aluno (soft delete)
  - Atualiza `users.isActive = false`
  - Validar tenant antes de desativar
- [x] `StudentsRepository`:
  - `create(data)` — insere na tabela students
  - `findAll(tenantId, options)` — lista com JOIN em users, filtra por personalId
  - `findById(id, tenantId)` — busca com AND personalId = tenantId
- [x] Resend provider + template e-mail de convite
  - Conteudo: nome do aluno, nome do personal, botao "Definir minha senha" → `/{slug}/set-password?token={rawToken}`
  - Aviso de expiracao: link valido por 48 horas
- [x] Tests (TDD — escrever antes da implementacao):
  - [x] `create-student.controller.spec.ts` + `create-student.service.spec.ts`
  - [x] `list-students.controller.spec.ts` + `list-students.service.spec.ts`
  - [x] `get-student.controller.spec.ts` + `get-student.service.spec.ts`
  - [x] `update-student.controller.spec.ts` + `update-student.service.spec.ts`
  - [x] `deactivate-student.controller.spec.ts` + `deactivate-student.service.spec.ts`
  - [x] Incluir caso de teste: tentar acessar student de outro tenant → 404

### Subtasks Frontend
- [x] Rota: `/painel/alunos`
- [x] Tabela de alunos com paginacao, busca e colunas: nome, e-mail, status, data de cadastro
- [x] Rota de criacao: modal (Dialog) com formulario
- [x] Formulario com React Hook Form + Zod (nome, e-mail — sem campo de senha)
- [x] Feedback apos criacao: toast "Convite enviado para {email}..."
- [x] Badge de status (ativo/inativo)
- [x] Acoes por linha: ver detalhe, editar (dialog), desativar (AlertDialog)
- [x] Pagina de detalhe: `/painel/alunos/:id`
  - Dados do aluno com formulario de edicao inline
  - Treinos atribuidos (placeholder — US-009)
  - Proximos agendamentos (placeholder — US-014)

### Notas Tecnicas
- O `name` e `email` do aluno vivem em `users` — as queries de listagem fazem JOIN
- `isActive` esta em `users`, nao em `students` — desativar = atualizar `users.isActive`
- `users.password` pode ser `null` ate o aluno definir sua senha
- Um usuario so pode ser aluno de UM personal (userId e unico em students)
- Paginacao no formato padrao: `{ content, page, size, totalElements, totalPages }`
- O token raw nunca e persistido — apenas o hash sha256 e salvo no banco
- Token expira em 48h — se expirado, exibir mensagem e orientar o personal a reenviar convite

### Schema e Migration necessarios (antes de implementar US-005)
- [x] Alterar `users.password` de `notNull()` para nullable no schema Drizzle
- [x] Gerar migration: `ALTER TABLE users ALTER COLUMN password DROP NOT NULL` (0001_jazzy_romulus.sql)
- [x] Atualizar `LoginService`: se `user.password === null` → lancar `UnauthorizedException("Senha nao definida. Verifique seu e-mail de convite.")`
- [x] `login.service.spec.ts`: adicionar caso de teste — login com senha null → UnauthorizedException

---

## US-005b — Aluno define sua senha via link de convite

**Status:** `[x]` done
**Sprint:** 2
**Dependencias:** US-005

**Descricao:**
Como aluno, quero receber um link por e-mail e definir minha propria senha para acessar a plataforma com seguranca.

### Criterios de Aceite
- [ ] Endpoint publico (sem autenticacao): `POST /auth/setup-password`
- [ ] Valida o token: existe, nao expirado, nao ja utilizado
- [ ] Valida a nova senha: minimo 8 caracteres
- [ ] Faz hash da senha com argon2id e atualiza `users.password`
- [ ] Marca o token como usado (`usedAt = now()`)
- [ ] Token invalido ou expirado → 400 com mensagem clara
- [ ] Apos definicao de senha com sucesso → aluno pode fazer login normalmente
- [ ] Rota frontend publica: `/{personal-slug}/set-password?token=xxx`

### Diretivas de Implementacao
- Context: `src/modules/auth/contexts/setup-password/`
- Decorator `@Public()` na rota
- Reutilizar `PasswordSetupTokensRepository`
- Hash de senha: argon2id (mesmo utilitario do register)

### Subtasks Backend
- [x] `POST /auth/setup-password` — definir senha via token de convite
  - Body: `{ token: string, password: string, confirmPassword: string }`
  - Validacoes: token presente, password min 8 chars, passwords iguais
  - Busca token pelo hash, valida expiracao e uso anterior
  - Atualiza `users.password` com argon2id hash
  - Marca token como usado
  - Retorna `{ message: 'Senha definida com sucesso' }`
- [x] `setup-password.controller.spec.ts` + `setup-password.service.spec.ts`
  - Caso: token valido → senha definida com sucesso
  - Caso: token invalido → 400
  - Caso: passwords nao coincidem → 400

### Subtasks Frontend
- [x] Pagina publica: `app/[slug-personal]/(personal)/set-password/page.tsx`
  - Parametro `token` extraido da URL via `useSearchParams()`
  - Formulario: campo "Nova senha" + campo "Confirmar senha" (com toggle show/hide)
  - Validacao client-side com Zod (min 8 chars, passwords iguais)
  - Submit chama `POST /auth/setup-password`
  - Estado: loading, erro (token invalido/expirado com orientacao), sucesso
- [x] Apos sucesso: mensagem + botao para `/{slug}/login`
- [x] Token ausente na URL: estado de erro especifico
- [x] Responsivo, mobile-first, usa themeColor do personal (herda do layout)

### Notas Tecnicas
- A pagina fica sob `[personal-slug]` para herdar o layout/tema do personal do aluno
- O token e passado apenas via URL (query param) e enviado no body do POST — nunca exposto em logs
- Nao criar sessao automatica apos definir senha — o aluno deve fazer login normalmente
- Guard de autenticacao nao deve bloquear esta rota (`@Public()`)

---

## US-006 — Login do Aluno

> **Removida.** Absorvida por US-002 (Login Unificado).
> Ver [epic-01-auth.md](epic-01-auth.md).
