# Epic 10 — Agenda e Produtividade do Personal

Status: `[ ]` todo

---

## US-024 — Personal cria sessao ja vinculada a aluno

**Status:** `[ ]` todo
**Sprint:** 8
**Dependencias:** US-014

**Descricao:**
Como personal, quero criar uma sessao para um aluno diretamente na minha agenda para reservar horario sem depender da acao do aluno.

### Criterios de Aceite
- [ ] Personal pode criar booking com `studentId` pela agenda
- [ ] Regras de conflito de horario continuam valendo
- [ ] Sessao criada aparece no painel do aluno em "Proximas sessoes"
- [ ] Opcional de nota inicial na sessao

### Subtasks Backend
- [ ] `POST /bookings/personal` (role `PERSONAL`)
- [ ] Validar aluno pertence ao tenant (personal)
- [ ] Reutilizar validacoes de conflito e service plan
- [ ] Unit tests do novo context

### Subtasks Frontend
- [ ] Formulario "Adicionar sessao" em `/painel/agenda`
- [ ] Campos: aluno, plano de servico, data, horario, nota
- [ ] Atualizar lista apos criacao com `invalidateQueries`
- [ ] Feedback de sucesso/erro com toast

---

## US-025 — Notas de sessao e historico rapido

**Status:** `[ ]` todo
**Sprint:** 8
**Dependencias:** US-024

**Descricao:**
Como personal, quero registrar notas curtas por sessao para acompanhar evolucao do atendimento sem abrir tela complexa.

### Criterios de Aceite
- [ ] Personal pode editar nota de uma sessao agendada/concluida
- [ ] Nota visivel no detalhe do agendamento e no historico do aluno
- [ ] Limite de tamanho (ex: 1000 chars) com validacao

### Subtasks Backend
- [ ] `PATCH /bookings/:id/notes`
- [ ] Validar ownership do booking pelo personal
- [ ] Unit tests de update notes

### Subtasks Frontend
- [ ] Campo de notas no dialog de detalhe da sessao
- [ ] Secao de historico resumido no detalhe do aluno
- [ ] Estados de loading/saving

---

## US-026 — Busca e filtros globais no painel

**Status:** `[ ]` todo
**Sprint:** 9
**Dependencias:** nenhuma

**Descricao:**
Como personal, quero buscar rapidamente alunos, treinos e sessoes para reduzir tempo de navegacao entre modulos.

### Criterios de Aceite
- [ ] Busca global no header do painel (atalho `Ctrl/Cmd + K`)
- [ ] Resultados agrupados por tipo: alunos, treinos, agenda
- [ ] Navegacao direta para a entidade selecionada
- [ ] Filtros basicos por status/data para resultados de agenda

### Subtasks Backend
- [ ] Endpoint `GET /search/global?q=...` (tenant-aware)
- [ ] Query federada leve (students + workout_plans + bookings)
- [ ] Limite e ordenacao por relevancia simples

### Subtasks Frontend
- [ ] Componente de command palette com shadcn
- [ ] Integracao com endpoint de busca
- [ ] Keyboard navigation + acessibilidade

---

## US-027 — Dashboard operacional simples do personal

**Status:** `[ ]` todo
**Sprint:** 9
**Dependencias:** US-024

**Descricao:**
Como personal, quero metricas operacionais simples para acompanhar meu ritmo semanal sem complexidade de BI.

### Criterios de Aceite
- [ ] Card: sessoes da semana
- [ ] Card: sessoes concluidas vs no-show (7/30 dias)
- [ ] Card: alunos ativos
- [ ] Card: treinos ativos atribuidos
- [ ] Filtro de periodo simples (7d/30d)

### Subtasks Backend
- [ ] Endpoint `GET /dashboard/personal/stats?period=7d|30d`
- [ ] Agregacoes basicas em repository dedicado
- [ ] Unit tests de calculo

### Subtasks Frontend
- [ ] Evoluir `/painel` com filtro 7d/30d
- [ ] Skeleton loaders e estado vazio
- [ ] Responsividade mobile

