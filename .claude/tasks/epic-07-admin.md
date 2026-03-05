# Epic 07 — Area do Admin

Status: `[ ]` todo

---

## US-017 — Admin gerencia personals

**Status:** `[ ]` todo
**Sprint:** 6
**Dependencias:** US-002

**Descricao:**
Como administrador da plataforma, quero visualizar e gerenciar os profissionais cadastrados para controlar o uso da plataforma e resolver problemas.

### Criterios de Aceite
- [ ] Listar todos os personals (paginado, com busca por nome ou e-mail)
- [ ] Ver detalhes: dados do usuario, plano de assinatura atual, status, data de cadastro
- [ ] Ativar/desativar conta de personal
- [ ] Acesso restrito a role `ADMIN`

### Diretivas de Implementacao
- Modulo: `src/modules/admin/`
- Contexts: `personals/list/`, `personals/get/`, `personals/toggle-status/`
- Reutilizar `PersonalsRepository` do modulo de personals
- Guard de role `ADMIN` em todas as rotas

### Subtasks Backend
- [ ] `GET /admin/personals?page=&size=&search=` — listar todos (paginado)
- [ ] `GET /admin/personals/:id` — detalhe do personal
- [ ] `PATCH /admin/personals/:id/status` — ativar/desativar (body: `{ isActive: boolean }`)
- [ ] Guard: role `ADMIN` (usar `@Roles(ApplicationRoles.ADMIN)` e `RolesGuard` ja existente)
- [ ] Unit tests para cada context

### Subtasks Frontend
- [ ] Rota: `/admin/personals`
- [ ] Tabela com: nome, e-mail, plano atual, status, data de cadastro
- [ ] Paginacao e busca por nome/e-mail
- [ ] Toggle de status inline
- [ ] Pagina de detalhe: `/admin/personals/:id`
- [ ] Dark mode (diretiva do CLAUDE.md para area admin)

### Notas Tecnicas
- O `RolesGuard` ja existe em `shared/guards/roles.guard.ts`
- O decorator `@Roles()` ja existe em `shared/decorators/roles.decorator.ts`
- Area admin usa dark mode (diferente da area personal que usa light mode)

---

## US-018 — Admin gerencia planos SaaS

**Status:** `[ ]` todo
**Sprint:** 6
**Dependencias:** US-017

**Descricao:**
Como administrador, quero criar e gerenciar os planos de assinatura da plataforma para controlar a oferta de planos e precos.

### Criterios de Aceite
- [ ] CRUD completo de planos
- [ ] Reordenar planos (campo `order`)
- [ ] Ativar/desativar plano sem excluir
- [ ] Edicao de nome, preco, descricao, beneficios, destaque (`highlighted`)
- [ ] Acesso restrito a role `ADMIN`

### Subtasks Backend
- [ ] `POST /admin/plans` — criar plano
- [ ] `GET /admin/plans` — listar todos (incluindo inativos)
- [ ] `PATCH /admin/plans/:id` — atualizar plano
- [ ] `PATCH /admin/plans/:id/status` — ativar/desativar
- [ ] `PATCH /admin/plans/reorder` — reordenar (body: `[{ id, order }]`)
- [ ] `PlansRepository` com CRUD completo (criar metodos adicionais alem do `findAllActive`)
- [ ] Guard: role `ADMIN`
- [ ] Unit tests para cada context

### Subtasks Frontend
- [ ] Rota: `/admin/plans`
- [ ] Tabela de planos com todas as colunas
- [ ] Drag & drop para reordenar
- [ ] Modal de criacao/edicao com React Hook Form + Zod
- [ ] Toggle ativo/inativo inline
- [ ] Campo beneficios como lista dinamica (adicionar/remover itens)

### Notas Tecnicas
- O endpoint `PATCH /admin/plans/reorder` precisa ser registrado ANTES de `PATCH /admin/plans/:id` para evitar conflito de rotas no NestJS
- Campo `benefits` no banco e varchar com itens separados por virgula — serializar/deserializar no repository
- Ao desativar plano, verificar se ha personals com assinatura ativa nesse plano (apenas avisar, nao bloquear)
