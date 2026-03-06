# Epic 07 — Area do Admin

Status: `[x]` done (backend)

---

## US-018 — Admin gerencia personals

**Status:** `[x]` done (backend)
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
- [x] `GET /admin/personals?page=&size=&search=` — listar todos (paginado)
- [x] `GET /admin/personals/:id` — detalhe do personal
- [x] `PATCH /admin/personals/:id/status` — ativar/desativar (body: `{ isActive: boolean }`)
- [x] `AdminPersonalsRepository` com queries paginadas e join com users e plans
- [x] Guard: role `ADMIN` (usar `@Roles(ApplicationRoles.ADMIN)` e `RolesGuard` ja existente)
- [x] Unit tests para cada context

### Subtasks Frontend
- [ ] Rota: `/admin/personals`
- [ ] Tabela com: nome, e-mail, plano atual, status, data de cadastro
- [ ] Paginacao e busca por nome/e-mail
- [ ] Toggle de status inline
- [ ] Pagina de detalhe: `/admin/personals/:id`
- [ ] Dark mode (diretiva do CLAUDE.md para area admin)

---

## US-019 — Admin gerencia planos SaaS

**Status:** `[x]` done (backend)
**Sprint:** 6
**Dependencias:** US-018

**Descricao:**
Como administrador, quero criar e gerenciar os planos de assinatura da plataforma para controlar a oferta de planos e precos.

### Criterios de Aceite
- [ ] CRUD completo de planos
- [ ] Reordenar planos (campo `order`)
- [ ] Ativar/desativar plano sem excluir
- [ ] Edicao de nome, preco, descricao, beneficios, destaque (`highlighted`)
- [ ] Acesso restrito a role `ADMIN`

### Subtasks Backend
- [x] `POST /admin/plans` — criar plano
- [x] `GET /admin/plans` — listar todos (incluindo inativos)
- [x] `PATCH /admin/plans/:id` — atualizar plano
- [x] `PATCH /admin/plans/:id/status` — ativar/desativar
- [x] `PATCH /admin/plans/reorder` — reordenar (body: `{ items: [{ id, order }] }`)
- [x] `PlansRepository` expandido: `findAll`, `create`, `update`, `updateStatus`, `updateOrder`
- [x] Guard: role `ADMIN`
- [x] Unit tests para cada context

### Subtasks Frontend
- [ ] Rota: `/admin/plans`
- [ ] Drag & drop para reordenar
- [ ] Modal de criacao/edicao
- [ ] Toggle ativo/inativo inline

---

## US-020 — Dashboard Admin (Business Intelligence)

**Status:** `[x]` done (backend)
**Sprint:** 7
**Dependencias:** US-016, US-018

**Descricao:**
Como administrador do negócio, quero visualizar indicadores de desempenho da plataforma para tomar decisões estratégicas baseadas em dados reais.

### Criterios de Aceite
- [ ] Dashboard com métricas principais (KPIs):
  - **MRR (Monthly Recurring Revenue):** Soma dos planos ativos.
  - **Total de Assinantes:** Quantidade de personals com assinatura ativa.
  - **Novos Assinantes:** Crescimento nos últimos 30 dias.
  - **Churn Rate:** Taxa de cancelamento no período.
- [ ] Gráfico de Distribuição de Planos (quais planos são mais assinados).
- [ ] Gráfico de Crescimento de Receita (linha do tempo mensal).
- [ ] Visão de Saúde do Sistema: Total de alunos cadastrados em toda a plataforma.
- [ ] Filtro de período (7 dias, 30 dias, 90 dias, Todo o período).

### Diretivas de Implementacao
- Modulo: `src/modules/admin/dashboard/`
- Context: `get-stats/`
- Centralizar queries de agregação em um serviço específico para performance.

### Subtasks Backend
- [x] `GET /admin/dashboard/stats` — retorna KPIs financeiros e de usuários.
- [x] `GET /admin/dashboard/charts` — retorna dados formatados para gráficos de série temporal.
- [x] `DashboardRepository` com queries de agregação (`count`, `sum`, `groupBy`, `generate_series`).
- [x] Lógica de cálculo de growthRate vs período anterior.
- [x] Filtro de período: `?period=7d|30d|90d|all`.

### Subtasks Frontend
- [ ] Rota: `/admin/dashboard` (Página inicial do Admin).
- [ ] Layout de Grid com Cards de estatísticas.
- [ ] Integração com `Recharts` para gráficos de Área (Crescimento) e Pizza (Planos).
- [ ] Select de período para atualizar os dados do Dashboard.
- [ ] Skeletton loaders para transição de filtros.

### Notas Tecnicas
- Calcular MRR multiplicando a contagem de assinaturas ativas pelo `price` de cada plano.
- Para o Churn, monitorar o webhook do Stripe (`customer.subscription.deleted`) e registrar a data de cancelamento se ainda não houver um campo para isso.
- O Dashboard Admin deve ser a página padrão ao logar com perfil `ADMIN`.
