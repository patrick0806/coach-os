# Epic 11 — Treinos, Midia e Tema

Status: `[ ]` todo

---

## US-028 — Midia de execucao em exercicios (video/gif)

**Status:** `[ ]` todo
**Sprint:** 9
**Dependencias:** US-007

**Descricao:**
Como personal, quero anexar video ou gif em exercicios para que o aluno entenda melhor a execucao sem precisar de instrucoes textuais extensas.

### Criterios de Aceite
- [ ] Exercicio aceita `mediaUrl` e `mediaType` (`video` | `gif`)
- [ ] Upload validado: tipos aceitos `video/mp4`, `image/gif`; tamanho maximo 50MB para video, 10MB para gif
- [ ] Aluno visualiza a midia no detalhe do treino (player para video, img para gif)
- [ ] Fallback visual padrao quando exercicio nao tiver midia (icone + texto "Sem midia")
- [ ] Personal pode remover midia existente de um exercicio

### Subtasks Backend
- [ ] Migration: adicionar `media_url` (text, nullable) e `media_type` (enum `video|gif`, nullable) em `exercises`
- [ ] Endpoint `POST /exercises/:id/media` — upload multipart para S3
  - Validacao de MIME type e tamanho no backend (nao confiar apenas no frontend)
  - Retorna `{ mediaUrl, mediaType }`
- [ ] Endpoint `DELETE /exercises/:id/media` — remove midia do S3 e limpa campos no banco
- [ ] Unit tests: upload valido, tipo invalido, tamanho excedido, remocao

### Subtasks Frontend
- [ ] Formulario de exercicio: zona de upload com preview
  - Preview de gif como `<img>` e video com `<video controls>`
  - Indicador de progresso de upload
  - Botao "Remover midia" quando ja existe
- [ ] Render de midia no treino do aluno (area `/[slug]/alunos/treinos`)
  - Video com `controls`, `playsInline`, `preload="metadata"`
  - Gif como imagem estatica (sem controles)
  - Placeholder padrao sem midia
- [ ] Validacao client-side de tipo e tamanho antes do upload (UX)

---

## US-029 — Separar fichas em modelo (generica) e especifica por aluno

**Status:** `[ ]` todo
**Sprint:** 10
**Dependencias:** US-008, US-009

**Descricao:**
Como personal, quero organizar minhas fichas em modelos reutilizaveis e fichas especificas por aluno para reduzir poluicao na listagem e facilitar a manutencao de treinos padronizados.

### Criterios de Aceite
- [ ] Workout plan possui tipo `planKind`: `template` ou `student`
- [ ] Ao criar plano, personal escolhe o tipo (padrao: `template`)
- [ ] Lista de treinos separada por abas: "Modelos" e "Por aluno"
- [ ] Acao "Aplicar para aluno" em modelos: cria copia editavel com `planKind = student` e `sourceTemplateId` preenchido
  - Copia e independente do original (nao e referencia — modificacoes nao afetam o modelo)
  - Nome padrao da copia: "Copia de <nome do modelo>"
- [ ] Aba "Por aluno" tem filtro por nome do aluno
- [ ] Fichas do tipo `student` devem poder ser atribuidas a alunos (comportamento atual)

### Subtasks Backend
- [ ] Migration em `workout_plans`:
  - Campo `plan_kind` (`template` | `student`), default `template`
  - Campo `source_template_id` (FK nullable para `workout_plans.id`)
- [ ] Ajustar `GET /workout-plans` para aceitar query `?kind=template|student`
- [ ] Endpoint `POST /workout-plans/:id/apply` — aplica modelo para aluno
  - Body: `{ studentId?: string }` (opcional, pode atribuir depois)
  - Copia transacional: plano + todos os workout_exercises (mesmas series, reps, carga, notas, ordem)
  - Retorna o novo plano criado
- [ ] Unit tests: criacao por tipo, listagem filtrada, copia transacional (exercicios incluidos), aplicacao para aluno

### Subtasks Frontend
- [ ] Refatorar `/painel/treinos` com `Tabs` do shadcn: "Modelos" | "Por aluno"
  - Cada aba busca com `?kind=template` ou `?kind=student`
- [ ] Botao "Aplicar para aluno" em cards de modelos
  - Dialog: select de aluno (opcional neste momento) + botao confirmar
  - Apos criar: navegar para o novo plano (toast com link)
- [ ] Aba "Por aluno": filtro de busca por nome do aluno
- [ ] Formulario de criacao de treino: toggle de tipo (modelo / por aluno)

---

## US-030 — Duplicar ficha/modelo com 1 clique

**Status:** `[ ]` todo
**Sprint:** 10
**Dependencias:** US-029

**Descricao:**
Como personal, quero duplicar uma ficha rapidamente para criar variacoes sem reconstruir todos os exercicios do zero.

### Criterios de Aceite
- [ ] Acao "Duplicar" disponivel em treinos do tipo `template` e `student`
- [ ] Copia inclui exercicios, ordem, series, repeticoes, carga e notas de cada exercicio
- [ ] Nome padrao da copia: "Copia de <nome>"
- [ ] `planKind` da copia e o mesmo do original
- [ ] `sourceTemplateId` da copia: `null` (copia e independente, nao rastreia origem)

### Subtasks Backend
- [ ] `POST /workout-plans/:id/duplicate`
  - Sem body necessario
  - Duplicacao transacional: plano + todos os `workout_exercises` com mesmos atributos
  - Retorna o novo plano
- [ ] Unit tests: copia completa, exercicios incluidos, nome padrao, planKind preservado

### Subtasks Frontend
- [ ] Botao "Duplicar" nas listagens (dropdown de acoes) e na tela de detalhe do treino
- [ ] Sem confirmacao necessaria (acao e nao-destrutiva)
- [ ] Apos duplicar: `invalidateQueries(['workout-plans'])` + toast com link "Abrir copia"
- [ ] Loading state no botao durante a operacao

---

## US-031 — Tema dark/light no painel do personal

**Status:** `[ ]` todo
**Sprint:** 11
**Dependencias:** US-003

**Descricao:**
Como personal, quero escolher entre tema claro e escuro no painel para melhorar conforto visual conforme minha preferencia.

### Criterios de Aceite
- [ ] Preferencia de tema salva no perfil do personal (persistida entre sessoes e dispositivos)
- [ ] Toggle de tema acessivel no painel (header ou secao de perfil)
- [ ] Padrao inicial: tema claro (`light`)
- [ ] Admin e area do aluno mantem seus temas fixos (dark) — alteracao nao afeta essas areas

### Subtasks Backend
- [ ] Migration: adicionar `ui_theme` (`light` | `dark`, default `light`) em `personals`
- [ ] Incluir `uiTheme` no response de `GET /personals/me/profile`
- [ ] Aceitar `uiTheme` no `PATCH /personals/me/profile`
- [ ] Unit tests nos DTOs e service (happy path + valor invalido)

### Subtasks Frontend
- [ ] Integrar `next-themes` no shell do painel personal (`/painel/*`)
- [ ] Ao carregar perfil, aplicar `uiTheme` como tema inicial do `ThemeProvider`
- [ ] Toggle em `/painel/perfil` (secao Aparencia) — sincroniza com backend via `PATCH`
- [ ] Garantir que o tema do painel nao vaze para `/admin` nem para `/{slug}/alunos`
- [ ] Ajustar classes de componentes do painel para suportar ambos os temas (checar variaveis Tailwind)

---
