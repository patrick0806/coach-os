# Epic 14 — Refinamento de UI/UX (Premium Experience)

Status: `[ ]` in progress

> **Objetivo:** Elevar a identidade visual do Painel do Personal e da Área do Aluno para coincidir com a aparência premium, refinada e moderna das páginas institucionais (Landing Page). O foco é em estética "high-end", legibilidade e uma experiência de usuário fluida.

---

## US-040 — Unificação do Design System e Tokens Premium

**Status:** `[ ]` todo
**Sprint:** 14
**Dependências:** Nenhuma

**Descrição:**
Como desenvolvedor, quero unificar os tokens de design (cores, sombras, arredondamentos, gradientes) baseados na Landing Page para que todas as áreas do sistema tenham a mesma percepção de qualidade.

### Critérios de Aceite
- [ ] Definir e documentar paleta de cores "Premium" (tons de cinza profundo, acentos de gradiente primário).
- [ ] Padronizar arredondamentos para `rounded-2xl` e `rounded-3xl` em cards e botões principais.
- [ ] Implementar efeitos de "Glassmorphism" (`backdrop-blur`) consistentes em headers e overlays.
- [ ] Criar/Atualizar componentes base (Button, Card, Input) na pasta `ui/` ou `shared/` com variantes "Premium".
- [ ] Garantir que o tema escuro (Dark Mode) seja o padrão ou tenha um refinamento superior.

### Subtasks Frontend
- [ ] Configurar `tailwind.config.ts` com extensões para sombras suaves e gradientes da marca.
- [ ] Criar `src/components/ui/premium-card.tsx` com suporte a bordas sutis e brilho interno.
- [ ] Refatorar `Navbar` e `Sidebar` para usar o novo padrão visual (transparências e desfoque).

---

## US-041 — Área do Aluno: Dashboard e Experiência Mobile Premium

**Status:** `[ ]` todo
**Sprint:** 14
**Dependências:** US-040

**Descrição:**
Como aluno, quero acessar um dashboard moderno e visualmente impactante para me sentir motivado e perceber o valor profissional do meu treinador.

### Critérios de Aceite
- [ ] Redesenhar o Dashboard do Aluno (`[slug-personal]/(alunos)/alunos/painel`) com foco em dispositivos móveis.
- [ ] Usar gradientes e tipografia de destaque para o "Treino do Dia" ou "Próximo Agendamento".
- [ ] Implementar visualização de progresso com gráficos ou indicadores refinados (menos "tabela", mais "app fitness").
- [ ] Melhorar os estados vazios (empty states) com ilustrações ou ícones estilizados.

### Subtasks Frontend
- [ ] Redesenhar o shell do aluno (`StudentShell`) para uma navegação mais moderna (ex: bottom navigation em mobile).
- [ ] Implementar cards de treino com imagens de fundo sutis ou ícones grandes e modernos.
- [ ] Ajustar espaçamentos (padding/gap) para uma sensação de "respiro" e luxo.

---

## US-042 — Painel do Personal: Dashboard e Navegação Refinada

**Status:** `[ ]` todo
**Sprint:** 14
**Dependências:** US-040

**Descrição:**
Como Personal Trainer, quero um painel de controle que transmita profissionalismo e autoridade através de um design limpo e sofisticado.

### Critérios de Aceite
- [ ] Atualizar o Dashboard principal (`/painel`) para remover o aspecto de "template administrativo padrão".
- [ ] Refinar `StatCard` com micro-interações e visuais mais ricos (ex: ícones com fundo em gradiente suave).
- [ ] Melhorar a hierarquia visual das "Próximas Sessões" para facilitar a leitura rápida.
- [ ] Garantir que a transição entre temas (Light/Dark) mantenha a elegância em ambos.

### Subtasks Frontend
- [ ] Atualizar `PainelPage` e `StatCard` para usar os novos componentes premium.
- [ ] Refatorar a `PainelSidebar` com estados ativos mais elegantes e tipografia refinada.
- [ ] Adicionar elementos visuais de profundidade (sombras em camadas, blurs de fundo).

---

## US-043 — Execução de Treino: Interface Focada e Polida

**Status:** `[ ]` todo
**Sprint:** 14
**Dependências:** US-041

**Descrição:**
Como aluno, quero uma interface de execução de treino que seja bonita e funcional, facilitando o foco nos exercícios com um visual de app nativo.

### Critérios de Aceite
- [ ] Redesenhar a visualização de exercícios com foco em mídia (vídeos do YouTube) e cronômetro.
- [ ] Usar componentes de input de carga e repetições que sejam fáceis de usar no celular e visualmente integrados.
- [ ] Implementar animações suaves de transição entre exercícios ou séries.
- [ ] Feedback visual claro para "Série Concluída" e "Descanso".

### Subtasks Frontend
- [ ] Refatorar componentes de treino em `[slug-personal]/(alunos)/alunos/treinos`.
- [ ] Melhorar o player de vídeo integrado e os controles de cronômetro.
- [ ] Implementar um modo "Foco" ou "Tela Cheia" para a execução do treino.

---

## Notas de Design (Referência: Landing Page)
- **Cores:** Fundo quase preto (`#0a0a0a`), Primária em gradiente, Texto `muted-foreground` com bom contraste.
- **Tipografia:** Tracking apertado em títulos (`tracking-tight`), pesos de fonte variados para hierarquia clara.
- **Efeitos:** `ring-1 ring-border/70 backdrop-blur`, `shadow-2xl shadow-primary/20` em elementos de destaque.
- **Arredondamento:** Preferência por `rounded-2xl` (16px) ou `rounded-3xl` (24px).
