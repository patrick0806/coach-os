# Epic 03 — Gestao de Alunos

Status: `[ ]` todo

> **Revisao aplicada:** ver [architectural-review.md](architectural-review.md)
> A tabela `students` nao tem mais `name`, `email`, `password` proprios.
> Criar student = criar `users` + `students` em transacao.
> Isolamento de tenant via `personalId` extraido do JWT em todos os repositories.

---

## US-005 — Personal cadastra um aluno

**Status:** `[ ]` todo
**Sprint:** 2
**Dependencias:** US-002

**Descricao:**
Como personal trainer, quero cadastrar um novo aluno para gerenciar seus treinos e agenda.

### Criterios de Aceite
- [ ] Campos de entrada: nome, e-mail, senha temporaria
- [ ] E-mail unico na tabela `users` (nao pode existir outro user com o mesmo email)
- [ ] Criacao atomica (transaction): INSERT em `users` (role: STUDENT) + INSERT em `students` (userId, personalId)
- [ ] Aluno recebe e-mail de boas-vindas com credenciais via Resend
- [ ] Retorna dados do aluno criado: `{ studentId, userId, name, email, personalId, createdAt }` (sem senha)
- [ ] Personal so pode ver e criar alunos vinculados ao seu `personalId` (tenant isolation)
- [ ] Listar alunos com paginacao e busca por nome ou e-mail
- [ ] Desativar aluno (soft delete: `users.isActive = false`)

### Diretivas de Implementacao
- Modulo: `src/modules/students/`
- Contexts: `create-student/`, `list-students/`, `get-student/`, `update-student/`, `deactivate-student/`
- **Tenant isolation:** `tenantId = currentUser.personalId` — todos os repositories filtram por `students.personalId = tenantId`
- Resend API em `shared/providers/resend.provider.ts`
- Hash de senha com argon2id (mesmo do auth — reutilizar funcao utilitaria)
- **tenantId NUNCA vem de query params ou body — sempre do JWT**

### Subtasks Backend
- [ ] `POST /students` — criar aluno
  - Body: `{ name: string, email: string, temporaryPassword: string }`
  - Transaction: INSERT users (role STUDENT) + INSERT students (userId, personalId: currentUser.personalId)
  - Enviar e-mail de boas-vindas apos commit
- [ ] `GET /students?page=&size=&search=` — listar alunos do tenant autenticado (paginado)
  - Query com JOIN em `users` para pegar name e email
  - Response formato padrao: `{ content, page, size, totalElements, totalPages }`
- [ ] `GET /students/:id` — buscar aluno por ID
  - Repository: `WHERE students.id = $id AND students.personalId = $tenantId`
  - Se nao encontrado (incluindo cross-tenant) → 404
- [ ] `PATCH /students/:id` — atualizar dados do aluno
  - Campos editaveis: `name` (em users), `email` (em users)
  - Validar tenant antes de atualizar
- [ ] `DELETE /students/:id` — desativar aluno (soft delete)
  - Atualiza `users.isActive = false`
  - Validar tenant antes de desativar
- [ ] `StudentsRepository`:
  - `create(data, tenantId)` — insere users + students em transacao
  - `findAll(tenantId, pagination, search?)` — lista com JOIN em users, filtra por personalId
  - `findById(id, tenantId)` — busca com AND personalId = tenantId
  - `update(id, tenantId, data)` — atualiza users.name / users.email
  - `deactivate(id, tenantId)` — set users.isActive = false
- [ ] `UsersRepository` — metodos compartilhados por auth e students
- [ ] Resend provider + template e-mail de boas-vindas
- [ ] Tests (TDD — escrever antes da implementacao):
  - [ ] `create-student.controller.spec.ts` + `create-student.service.spec.ts`
  - [ ] `list-students.controller.spec.ts` + `list-students.service.spec.ts`
  - [ ] `get-student.controller.spec.ts` + `get-student.service.spec.ts`
  - [ ] `update-student.controller.spec.ts` + `update-student.service.spec.ts`
  - [ ] `deactivate-student.controller.spec.ts` + `deactivate-student.service.spec.ts`
  - [ ] Incluir caso de teste: tentar acessar student de outro tenant → 404

### Subtasks Frontend
- [ ] Rota: `/dashboard/students`
- [ ] Tabela de alunos com paginacao, busca e colunas: nome, e-mail, status, data de cadastro
- [ ] Rota de criacao: modal ou `/dashboard/students/new`
- [ ] Formulario com React Hook Form + Zod (nome, e-mail, senha temporaria)
- [ ] Badge de status (ativo/inativo)
- [ ] Acoes por linha: ver detalhe, editar, desativar
- [ ] Pagina de detalhe: `/dashboard/students/:id`
  - Dados do aluno
  - Treinos atribuidos (US-009)
  - Proximos agendamentos (US-014)

### Notas Tecnicas
- O `name` e `email` do aluno vivem em `users` — as queries de listagem fazem JOIN
- `isActive` esta em `users`, nao em `students` — desativar = atualizar `users.isActive`
- Um usuario so pode ser aluno de UM personal (userId e unico em students)
- Paginacao no formato padrao: `{ content, page, size, totalElements, totalPages }`
- O e-mail de boas-vindas deve conter: nome do personal, URL de acesso `/{slug}/login`, e-mail do aluno e senha temporaria

---

## US-006 — Login do Aluno

> **Removida.** Absorvida por US-002 (Login Unificado).
> Ver [epic-01-auth.md](epic-01-auth.md).
