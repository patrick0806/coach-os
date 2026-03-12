# BUG-004 — Problemas de Experiência e Redundância na Agenda

**Status:** `[ ]` todo
**Prioridade:** ALTA
**Relatado em:** 2026-03-12
**Módulo:** `frontend/painel/agenda`

## 📝 Descrição do Bug / UX
A aba "Calendário de Treinos" apresenta falhas de usabilidade e visualização:
1.  **Informação Duplicada:** Na Segunda-feira (Seg), aparece o treino da Maria (10:00–11:00) e simultaneamente o horário de atendimento (10:00–11:00) na lista de disponibilidade do topo, gerando ruído visual.
2.  **Grid Apertado:** A visualização está muito pequena tanto no desktop quanto no mobile, dificultando a leitura dos nomes dos alunos e dos horários.
3.  **Visualização Poluída:** Mostrar todos os horários de atendimento no topo de cada coluna consome muito espaço vertical, "empurrando" os treinos reais para baixo.

## 🎯 Melhoria Sugerida (Integrada ao Épico 23)
- [ ] **Desacoplar Disponibilidade:** Remover a lista de horários do topo das colunas do calendário.
- [ ] **Nova Aba de Disponibilidade:** Criar uma aba específica "Horários da Semana" para o Personal visualizar rapidamente sua grade base, deixando o Calendário focado apenas em compromissos reais e mostrar quais horários estão disponíveis para agendamento.
- [ ] **Responsividade:** Aumentar o tamanho dos cards de treino e permitir scroll horizontal no mobile para que as colunas tenham largura mínima legível.
- [ ] **Diferenciação Visual:** O Calendário deve mostrar apenas os treinos agendados; a disponibilidade deve ser apenas o "fundo" ou estar em outra aba.

## ✅ Critérios de Aceite
- [ ] Treinos ocupados não aparecem simultaneamente na lista de disponibilidade do mesmo dia.
- [ ] O grid do calendário deve ser expansível para melhor leitura no mobile/web.
- [ ] Limpeza visual da interface de calendário para focar nos compromissos.
