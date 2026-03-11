# Epic 14 — Refinamento de UI/UX (Premium Experience)

Status: `[ ]` in progress

> **Objetivo:** Elevar a identidade visual do Painel do Personal e da Área do Aluno para coincidir com a aparência premium, refinada e moderna das páginas institucionais. O foco é em estética "high-end", legibilidade extrema em ambientes de treino e uma experiência de usuário sem fricção.

---

## Diretriz Obrigatória de Implementação

Todas as histórias deste épico devem seguir o padrão definido em `CLAUDE.md` para frontend:

- usar Tailwind + tokens de tema existentes, evitando cores, sombras, raios, gradientes e fontes definidos inline por página;
- concentrar a fundação visual premium em `frontend/src/app/globals.css`, expandindo variáveis CSS, tokens semânticos, utilitários reutilizáveis e estilos base compartilhados;
- evitar criar arquivos de estilo locais, CSS module ou regras isoladas por tela para resolver identidade visual;
- componentes e páginas devem consumir classes globais e utilities sem duplicar receita visual;
- priorizar componentes `shadcn/ui` como base, criando wrappers reutilizáveis apenas quando a variação premium for recorrente;
- manter responsividade mobile first, acessibilidade AA e consistência entre área do personal e área do aluno.

### Definition of Done do Épico

- tokens premium centralizados em `frontend/src/app/globals.css`;
- estilos repetidos extraídos para classes/utilitários globais antes da conclusão da história;
- nenhum componente do épico deve depender de paleta local ou "one-off styling" para elementos estruturais;
- implementação pronta para reuso em futuras telas do produto sem copiar blocos extensos de classes.

---

## US-040 — Unificação do Design System e Tokens Premium

**Status:** `[x]` done
**Sprint:** 14
**Dependências:** Nenhuma

**Descrição:**
Unificar a fundação visual do sistema para que o aluno e o personal sintam que estão em um ecossistema coeso e de alta qualidade.

### Detalhes de Implementação (O "Como"):
- **Fundação Global:** Implementar em `frontend/src/app/globals.css` os tokens premium de cor, superfície, borda, sombra, radius e estados interativos que serão consumidos por todo o épico.
- **Cores:** Definir o "Deep Dark" (`#09090b` ou `#0a0a0a`) e suas superfícies derivadas como tokens semânticos globais. Usar `primary` e tokens derivados para estados ativos, nunca hex hardcoded nas páginas.
- **Glassmorphism:** Criar classes/utilidades globais para superfícies com blur e transparência. Headers, modais e shells devem reaproveitar essas classes ao invés de repetir combinações locais.
- **Tipografia:** Consolidar padrões globais de heading, suporte e leitura usando tokens e utilities reutilizáveis. Textos auxiliares devem continuar baseados em `text-muted-foreground`.
- **Componentes Base:**
  - `PremiumCard`: criar variante ou wrapper reutilizável com classes globais para borda, superfície e profundidade.
  - `PremiumButton`: criar variante reutilizável com estados premium centralizados, sem reinventar estilo em cada tela.

### Critérios de Aceite
- `frontend/src/app/globals.css` passa a ser a fonte única dos tokens visuais premium deste épico.
- qualquer card, botão, header ou modal novo deste épico usa classes/utilitários compartilhados;
- não há dependência de CSS local para identidade visual base.

---

## US-041 — Área do Aluno: Experiência de App Nativo e Dashboard Motivador

**Status:** `[x]` done
**Sprint:** 14
**Dependências:** US-040

**Descrição:**
Transformar a área do aluno em uma experiência que pareça um aplicativo instalado no celular, focando em facilidade de uso durante o treino.

### Detalhes de Navegação & UI:
- **Bottom Navigation (Mobile):** Substituir o header atual por uma barra de navegação inferior fixa com ícones grandes e labels curtos (Início, Treinos, Agenda).
- **Dashboard (Painel):**
  - **Hero Card (Treino do Dia):** Card de destaque com gradiente vibrante, exibindo o nome do treino, duração estimada e um botão de "Iniciar Agora" proeminente.
  - **Resumo de Progresso:** Uso de indicadores circulares (progress rings) para sessões concluídas no mês vs. meta.
- **Usabilidade:**
  - Pull-to-refresh para atualizar treinos ou agenda.
  - Feedback tátil visual (animações ao tocar em itens).
  - Empty states motivacionais: "Nenhum treino hoje? Que tal uma caminhada?" com ilustrações minimalistas.

### Diretriz Técnica desta História
- a bottom navigation, hero card, empty states e superfícies do dashboard devem usar os tokens e utilitários definidos na US-040;
- caso surja necessidade de novo padrão visual recorrente, ele deve ser promovido primeiro para `frontend/src/app/globals.css` e só então consumido na tela;
- evitar gradientes, sombras e espaçamentos exclusivos definidos diretamente na página quando houver potencial de reuso.

### Critérios de Aceite
- a experiência mobile reutiliza classes globais para navegação, cards e superfícies;
- animações e feedbacks visuais seguem padrões consistentes do design system premium;
- não há estilização estrutural "one-off" espalhada pelos componentes da área do aluno.

---

## US-042 — Painel do Personal: Centro de Comando Profissional

**Status:** `[x]` done
**Sprint:** 14
**Dependências:** US-040

**Descrição:**
Redesenhar o fluxo de trabalho do Personal para que a gestão de múltiplos alunos seja rápida e transmita autoridade técnica.

### Detalhes de Navegação & UI:
- **Sidebar "Flutuante":** Design de sidebar separada da borda da tela com `rounded-2xl` e `m-4`, usando `glassmorphism`.
- **Navegação Interna (Tab-less):** Transições fluidas entre "Alunos" e "Treinos" sem recarregar a página (foco em estados de transição do React).
- **Dashboard de Gestão:**
  - **Grid de Alunos Ativos:** Cards compactos com a foto do aluno, status do último treino (concluído/pendente) e link rápido para WhatsApp.
  - **Filtros Rápidos:** Botões de chip (ex: "Sem treino atribuído", "Vencendo hoje") para ação imediata.
- **Quick Action Button (FAB):** Um botão flutuante "+" no canto inferior para criar aluno, treino ou agendamento de qualquer lugar do painel.

### Diretriz Técnica desta História
- sidebar, chips, grid de cards, FAB e blocos de dashboard devem reutilizar o mesmo vocabulário visual global definido na US-040;
- a implementação deve preferir variantes de componentes compartilhados em vez de estilos específicos de rota;
- qualquer ajuste visual recorrente identificado no painel deve voltar para `frontend/src/app/globals.css` para manter o padrão do produto.

### Critérios de Aceite
- painel do personal implementado com consistência visual e sem CSS local para estilos-base;
- FAB, chips e cards seguem variantes reutilizáveis;
- a tela transmite identidade premium sem criar exceções difíceis de manter.

---

## US-043 — Player de Execução de Treino: Foco e Ergonomia

**Status:** `[x]` done
**Sprint:** 14
**Dependências:** US-041

**Descrição:**
Otimizar a interface de "dentro do treino" para ser operada com uma mão, em movimento, e com alta visibilidade.

### Detalhes de Usabilidade (Modo Treino):
- **Interface "Foco Total":** Ao iniciar um treino, ocultar barras de navegação globais. Exibir apenas o exercício atual, progresso total e cronômetro.
- **Mídia em Destaque:** Vídeo de execução do YouTube em tamanho generoso no topo, com controles simplificados.
- **Input Ergonômico de Cargas:**
  - Substituir campos de texto pequenos por "Steppers" (botões - e + grandes) para ajustar carga e repetições.
  - Botão de "Check" (Série Concluída) grande e centralizado na parte inferior (zona de alcance do polegar).
- **Cronômetro de Descanso:** Overlay ou área fixa que muda de cor (ex: de cinza para verde) quando o tempo de descanso acaba.
- **Histórico Contextual:** Pequeno indicador da carga usada no último treino diretamente ao lado do campo de input atual.

### Diretriz Técnica desta História
- o modo treino deve reaproveitar tokens globais de contraste, foco, destaque e estados de sucesso/atenção;
- overlays, controles grandes, cronômetro e steppers devem nascer como padrões reutilizáveis quando houver chance de reaplicação em outras jornadas;
- evitar estilização inline/local para resolver contraste, tamanho de toque ou profundidade visual.

### Critérios de Aceite
- interface de treino usa classes globais para superfícies, estados e hierarquia visual;
- componentes ergonômicos ficam preparados para reuso em outras experiências mobile;
- nenhum estilo crítico de legibilidade ou contraste fica acoplado apenas a esta página.

---

## Notas de Design (Padrão de Qualidade)
- **Sombras:** Usar `shadow-primary/10` para dar profundidade aos elementos de destaque.
- **Bordas:** Arredondamento padrão de `24px` (`rounded-3xl`) para cards maiores e `12px` (`rounded-xl`) para inputs.
- **Interações:** Hover states com leve aumento de brilho ou escala (`hover:brightness-110` ou `hover:scale-[1.02]`).
- **Acessibilidade:** Garantir contraste AA mesmo em Dark Mode e tamanhos de fonte legíveis a 1 metro de distância (comum em academias).
- **Padrão de Código:** Sempre que uma decisão visual se repetir em mais de um componente, ela deve subir para `frontend/src/app/globals.css` ou para uma variante compartilhada de componente.
