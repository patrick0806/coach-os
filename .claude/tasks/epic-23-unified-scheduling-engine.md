# Épico 23 — Motor de Agendamento Unificado (Agenda & Treinos)

**Status:** `[ ]` todo
**Prioridade:** Alta
**Responsáveis:** Dumbledore (Architect), Snape (Backend), Hermione (Frontend)

> **Objetivo:** Consolidar a gestão de tempo do Personal Trainer em um único motor. A "Agenda" (Disponibilidade) será o alicerce, e o "Planejador de Treinos" (Schedule Rules) será o executor. O sistema deve garantir que nenhum aluno presencial seja marcado fora do horário de trabalho ou em conflito com outro, enquanto permite flexibilidade para consultoria online. O resultado final é uma agenda pública na Landing Page (LP) que reflete a real disponibilidade do profissional de forma semanal (Seg-Sex).

---

## 🎙️ Perspectivas dos Especialistas

### 🧙‍♂️ Albus Dumbledore (Architect)
*"A verdade reside na `availability_slots`. Ela define o 'grid' de tempo. O `schedule_rules` agora deve ser visto como uma reserva de slot nesse grid. Precisamos unificar os conceitos de `booking` e `training_session` para que o Personal tenha uma visão única de sua ocupação, priorizando o resumo diário (Hoje)."*

### 🧪 Severus Snape (Backend)
*"Vou transformar o `ScheduleEngine` no árbitro soberano. Ele não apenas expandirá regras em sessões, mas validará se cada regra respeita a `availability_slots` e não colide com outras regras 'Bloqueantes' (Presencial). Adicionarei o endpoint de disponibilidade semanal padrão para a LP."*

### 📚 Hermione Granger (Frontend)
*"Vou unificar as telas. O Personal terá um 'Dashboard de Agenda' onde vê seus horários de trabalho e, sobrepostos, os treinos de todos os alunos, começando sempre por 'Hoje'. Na LP, o componente de agendamento mostrará Seg-Sex e slots livres dinâmicos."*

---

## 📋 Histórias de Usuário e Tarefas Técnicas
### US-075 — Gestão de Horários de Trabalho e Visibilidade Unificada
- [ ] **Preservação da UI/UX de Disponibilidade:** Manter a interface atual de `/painel/agenda/disponibilidade` para o Personal definir seu grid base.
- [ ] **Nova Página de Agenda (Painel):**
    - Refatorar visualização para focar no "Hoje" (resumo do dia).
    - Criar aba "Horários da Semana" exclusiva para visualização do grid de disponibilidade (substituindo a lista no topo do calendário).
    - **[BUG-004] Aumentar responsividade:** Garantir que o calendário web/mobile tenha largura mínima legível para os cards.
- [ ] **Limpeza do Calendário:** Remover a exibição duplicada de horários de atendimento onde já existe um treino presencial marcado.
- [ ] **Bloqueios Manuais:** Permitir o bloqueio de horários diretamente na nova visualização de agenda.

---

### US-076 — Planejador de Treinos do Aluno (Refinado)
- [ ] **[BUG-003] Correção de Layout:** Garantir que o aviso "Fora da disponibilidade" não quebre o grid dos seletores de treino.
- [ ] **Fix do Seletor de Treino:** Garantir que o treino selecionado apareça corretamente em todos os cenários, independente de avisos.
- [x] **Evolução da `schedule_rule`:**
...

    - `sessionType` já cobre os tipos (`presential`, `online`, `rest`).
    - `startTime` e `endTime` adicionados (migration 0019, schema, repositórios).
- [x] **Validação em Tempo Real (UX):** No `student-schedule-planner.tsx`, validar instantaneamente se o horário escolhido para o aluno está dentro da disponibilidade do Personal e se não há conflitos.
- [x] **Sincronização com `training_sessions`:** ScheduleEngine propaga `startTime`/`endTime` para as sessões geradas. Validação de disponibilidade no `UpsertScheduleRulesService` antes de salvar.

---

### US-077 — Engine de Disponibilidade e Exposição na LP
- [ ] **Cálculo de Slots Livres (Padrão Semanal):** Implementar lógica no backend que calcule a disponibilidade semanal padrão (Seg-Sex) subtraindo os treinos presenciais fixos das `schedule_rules`.
- [ ] **Componente de Agendamento na LP:** Redesenhar a seção de agendamento na Landing Page do Personal para:
    - Exibir dias da semana (Segunda a Sexta), não datas específicas (12, 13...).
    - Ocultar automaticamente horários que possuam treinos presenciais fixos.
- [x] **Suporte a Timezones:** Nota "Horários no fuso do profissional" exibida ao visitante.

---

### US-078 — Migração e Depreciação de Bookings
- [ ] **Data Migration:** Converter `bookingSeries` existentes em `schedule_rules` para que passem a ser geridas pelo novo motor.
- [ ] **Cleanup de Código:** Remover o módulo `bookings` original (após migração bem-sucedida).

---

## 🚀 Regras de Negócio e Validações
1. **Regra de Ouro:** O tempo é o recurso mais escasso do Personal. O sistema deve impedir erros humanos de sobreposição.
2. **Prioridade de Bloqueio:**
    *   `Manual Block` > `Presencial Training` > `Availability`.
3. **Consultoria Online:** Funciona como uma 'camada fantasma' — não consome o slot físico.
4. **Resiliência:** Se o Personal alterar seu horário de trabalho para um período onde já existem treinos marcados, o sistema deve alertar sobre os "Treinos Órfãos".
