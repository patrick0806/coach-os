# BUG-004 — Problemas de Experiência e Redundância na Agenda

**Status:** `[ ]` todo
**Prioridade:** ALTA
**Relatado em:** 2026-03-12
**Módulo:** `frontend/painel/agenda`

## 📝 Descrição do Bug / UX
A aba "Calendário de Treinos" apresenta falhas de usabilidade e visualização que dificultam a gestão do Personal:

1.  **Informação Duplicada:** No dia de hoje (ex: Seg), aparece o treino da Maria (10:00–11:00) e simultaneamente a lista de horários de atendimento (09:00, 10:00, 11:00...) no topo da coluna. Isso gera poluição visual e confusão sobre o que é compromisso e o que é apenas horário vago.
2.  **Grid Apertado:** A visualização está muito pequena. No mobile, as colunas ficam ilegíveis. No desktop, os nomes dos alunos e horários nos cards (como o da Maria) ficam esmagados.
3.  **Visualização Poluída:** A lista de "chips" de horários de atendimento no topo de cada coluna consome quase todo o espaço vertical, empurrando os treinos reais para fora da área visível inicial.

## 🎯 Melhoria Sugerida (Conforme Screenshot de Referência 18:35:28)
- [ ] **Remover Lista de Horários do Topo:** Eliminar os chips de horários (ex: 09:00-10:00, 10:00-11:00) que aparecem dentro de cada coluna do dia.
- [ ] **Nova Aba "Horários da Semana":** Criar uma aba específica para o Personal visualizar sua grade horária base de forma limpa, separada dos compromissos diários.
- [ ] **Expandir Cards de Treino:** Aumentar o tamanho e o padding dos cards de treino (ex: Maria Oliveira) para que o nome, horário e status (ponto colorido) fiquem bem legíveis.
- [ ] **Responsividade:** Implementar largura mínima por coluna com scroll horizontal no mobile para evitar que o calendário "esmague" as informações.
- [ ] **Foco no "Hoje":** Ao abrir a agenda, o sistema deve centralizar/destacar o dia atual automaticamente.

## ✅ Critérios de Aceite
- [ ] O calendário de treinos exibe apenas os compromissos reais, sem a lista de disponibilidade "poluindo" o topo.
- [ ] Visualização limpa seguindo o padrão da screenshot de referência (cards espaçados e legíveis).
- [ ] Presença de uma aba dedicada para consulta da grade horária base (disponibilidade).
