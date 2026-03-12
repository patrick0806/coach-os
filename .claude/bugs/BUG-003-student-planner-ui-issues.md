# BUG-003 — Falhas Visuais no Planejador de Aluno

**Status:** `[ ]` todo
**Prioridade:** MÉDIA
**Relatado em:** 2026-03-12
**Módulo:** `frontend/painel/alunos`

## 📝 Descrição do Bug
O componente `StudentSchedulePlanner` apresenta instabilidades visuais e de layout:
1.  **Quebra de Grid:** O aviso "Fora da disponibilidade" empurra os elementos, desalinhando a linha do dia da semana.
2.  **Visibilidade do Treino:** Em dias sem erro de disponibilidade (ex: Terça-feira no screenshot), o seletor de plano de treino parece não renderizar o valor selecionado corretamente ou fica com largura inconsistente.
3.  **Inconsistência de Estado:** O seletor de treino parece só "aparecer" ou se comportar corretamente quando há um aviso de erro, o que indica uma falha na lógica de renderização condicional.

## 🔍 Causa Raiz (Análise Inicial)
O arquivo `frontend/src/app/painel/alunos/[id]/_components/student-schedule-planner.tsx` utiliza flexbox/grid que não reserva espaço para o aviso de erro, causando o "layout shift". A renderização do seletor de treino (`Select` do shadcn) pode estar sofrendo de problemas de largura (`w-full` vs largura fixa) quando cercado por outros elementos dinâmicos.

## ✅ Critérios de Aceite
- [ ] Alinhamento consistente dos elementos (Dia, Tipo, Treino, Horários) independente de avisos de erro.
- [ ] O seletor de plano de treino deve estar sempre visível e com largura adequada.
- [ ] O aviso "Fora da disponibilidade" deve aparecer abaixo ou em um local que não desloque os seletores laterais.
