# Epic 11 — Treinos, Midia e Tema

Status: `[ ]` todo

---

## US-028 — Midia de execucao em exercicios (video/gif)

**Status:** `[ ]` todo
**Sprint:** 9
**Dependencias:** US-007

**Descricao:**
Como personal, quero anexar video ou gif em exercicios para que o aluno entenda melhor a execucao.

### Criterios de Aceite
- [ ] Exercicio aceita `mediaUrl` e `mediaType` (`video` ou `gif`)
- [ ] Upload validado por tipo e tamanho maximo
- [ ] Aluno visualiza a midia no detalhe do treino
- [ ] Fallback quando exercicio nao tiver midia

### Subtasks Backend
- [ ] Migration para campos de midia em `exercises`
- [ ] Endpoint de upload de midia de exercicio
- [ ] Validacao MIME/size e persistencia em S3
- [ ] Unit tests de upload/update

### Subtasks Frontend
- [ ] Formulario de exercicio com upload + preview
- [ ] Render de video/gif no treino do aluno
- [ ] Placeholder padrao sem midia

---

## US-029 — Separar fichas em modelo (generica) e especifica por aluno

**Status:** `[ ]` todo
**Sprint:** 10
**Dependencias:** US-008, US-009

**Descricao:**
Como personal, quero organizar minhas fichas em modelos reutilizaveis e fichas especificas por aluno para reduzir poluicao e melhorar manutencao.

### Criterios de Aceite
- [ ] Workout plan possui tipo: `template` ou `student`
- [ ] Lista de treinos separada por abas: "Modelos" e "Por aluno"
- [ ] Aplicar modelo para aluno cria copia editavel (nao referencia mutavel)
- [ ] Filtro por aluno na aba "Por aluno"

### Subtasks Backend
- [ ] Migration em `workout_plans` com `planKind` e `sourceTemplateId` (nullable)
- [ ] Ajustar CRUD/listagem para suportar tipo
- [ ] Endpoint "aplicar modelo para aluno" criando copia transacional
- [ ] Unit tests dos novos fluxos

### Subtasks Frontend
- [ ] Refatorar `/painel/treinos` com tabs por tipo
- [ ] Acao "Aplicar para aluno" em modelos
- [ ] Listagem por aluno com busca/filtro

---

## US-030 — Duplicar ficha/modelo com 1 clique

**Status:** `[ ]` todo
**Sprint:** 10
**Dependencias:** US-029

**Descricao:**
Como personal, quero duplicar uma ficha rapidamente para criar variacoes sem reconstruir exercicios.

### Criterios de Aceite
- [ ] Acao "Duplicar" em treino template e treino de aluno
- [ ] Copia inclui exercicios, ordem, series, repeticoes, carga e notas
- [ ] Nome padrao da copia: "Copia de <nome>"

### Subtasks Backend
- [ ] `POST /workout-plans/:id/duplicate`
- [ ] Duplicacao transacional de plano + exercicios
- [ ] Unit tests cobrindo copia completa

### Subtasks Frontend
- [ ] Botao "Duplicar" nas listagens e detalhe
- [ ] Atualizacao otimista/invalidation da lista
- [ ] Toast de sucesso com link para abrir copia

---

## US-031 — Tema dark/light no painel do personal

**Status:** `[ ]` todo
**Sprint:** 11
**Dependencias:** US-003

**Descricao:**
Como personal, quero escolher entre tema claro e escuro no painel para melhorar conforto visual.

### Criterios de Aceite
- [ ] Preferencia de tema salva no perfil do personal
- [ ] Toggle de tema no painel/perfil
- [ ] Preferencia persistida entre sessoes e dispositivos
- [ ] Admin e area do aluno mantem tema atual

### Subtasks Backend
- [ ] Migration `personals.uiTheme` (`light|dark`)
- [ ] Incluir campo no get/update profile
- [ ] Unit tests dos DTOs e service

### Subtasks Frontend
- [ ] Integrar `next-themes` no shell do painel personal
- [ ] Toggle em `/painel/perfil` (Aparencia)
- [ ] Ajustar classes de componentes para ambos os temas
- [ ] Teste visual das rotas principais do painel

