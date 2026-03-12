# Épico 23 — Motor de Agendamento Unificado (Agenda & Treinos)

**Status:** `[ ]` todo
**Prioridade:** Alta
**Responsáveis:** Dumbledore (Architect), Snape (Backend), Hermione (Frontend)

> **Objetivo:** Consolidar a gestão de tempo do Personal Trainer em um único motor. A "Agenda" (Disponibilidade) será o alicerce, e o "Planejador de Treinos" (Schedule Rules) será o executor. O sistema deve garantir que nenhum aluno presencial seja marcado fora do horário de trabalho ou em conflito com outro, enquanto permite flexibilidade para consultoria online. O resultado final é uma agenda pública na Landing Page (LP) que reflete a real disponibilidade do profissional.

---

## 🎙️ Perspectivas dos Especialistas

### 🧙‍♂️ Albus Dumbledore (Architect)
*"A verdade reside na `availability_slots`. Ela define o 'grid' de tempo. O `schedule_rules` agora deve ser visto como uma reserva de slot nesse grid. Precisamos unificar os conceitos de `booking` e `training_session` para que o Personal tenha uma visão única de sua ocupação."*

### 🧪 Severus Snape (Backend)
*"Vou transformar o `ScheduleEngine` no árbitro soberano. Ele não apenas expandirá regras em sessões, mas validará se cada regra respeita a `availability_slots` e não colide com outras regras 'Bloqueantes' (Presencial). Adicionarei o campo `attendanceType` diretamente na `schedule_rule`."*

### 📚 Hermione Granger (Frontend)
*"Vou unificar as telas. O Personal terá um 'Dashboard de Agenda' onde vê seus horários de trabalho e, sobrepostos, os treinos de todos os alunos. Na LP, o componente de agendamento será dinâmico, calculando slots vazios em tempo real."*

---

## 📋 Histórias de Usuário e Tarefas Técnicas

### US-075 — Gestão de Horários de Trabalho (Core Agenda)
- [ ] **Preservação da UI/UX de Disponibilidade:** Manter a interface atual de `/painel/agenda/disponibilidade` (cards por dia, `DisponibilidadeDiaForm`, `CopiarDisponibilidadeModal`), garantindo que a usabilidade que o personal já aprovou seja mantida.
- [ ] **Refatoração do Backend para Disponibilidade:** Migrar o salvamento desses horários para a nova estrutura de `availability_slots` que servirá de grid para o motor unificado.
- [ ] **Bloqueios Manuais:** Adicionar a capacidade de marcar horários específicos como "Ocupado" diretamente na visualização de agenda, usando um padrão visual consistente com os slots de treino.
- [ ] **Visualização Unificada (Calendário):** Implementar uma visão de calendário mensal/semanal que sobreponha:
    - Fundo: Horário de atendimento (os slots definidos na US-075).
    - Camada 1: Bloqueios manuais e feriados.
    - Camada 2: Treinos de alunos (Sessions), com distinção visual entre Presencial e Online.

---

### US-076 — Planejador de Treinos do Aluno (Refinado)
- [ ] **Evolução da `schedule_rule`:**
    - Adicionar campo `attendanceType` (`online`, `presential`, `residential`).
    - Garantir que `startTime` e `endTime` sejam campos cidadãos de primeira classe na regra.
- [ ] **Validação em Tempo Real (UX):** No `student-schedule-planner.tsx`, validar instantaneamente se o horário escolhido para o aluno está dentro da disponibilidade do Personal e se não há conflitos.
- [ ] **Sincronização com `training_sessions`:** Ao salvar, o motor deve regenerar as sessões futuras, respeitando os novos parâmetros de tipo de atendimento e horário.

---

### US-077 — Engine de Disponibilidade Pública (Landing Page)
- [ ] **Cálculo de Slots Livres (Backend):**
    1. Base: `availability_slots` ativos.
    2. Subtrair: `schedule_rules` presenciais ativas.
    3. Subtrair: `training_sessions` (exceções/alterações pontuais).
    4. Subtrair: Bloqueios manuais.
- [ ] **Componente de Agendamento na LP:** Criar/Refinar o componente na página pública do Personal para exibir os horários resultantes do cálculo acima, mantendo a facilidade de uso para o visitante.
- [ ] **Suporte a Timezones:** Garantir que o visitante veja os horários no seu fuso, mas a reserva seja gravada no fuso do Personal (UTC no banco).

---

### US-078 — Migração e Depreciação de Bookings
- [ ] **Data Migration:** Converter `bookingSeries` existentes em `schedule_rules` para que passem a ser geridas pelo novo motor.
- [ ] **Cleanup de Código:** Remover o módulo `bookings` original (após migração bem-sucedida) para reduzir a dívida técnica e confusão arquitetural.

---

## 🚀 Regras de Negócio e Validações
1. **Regra de Ouro:** O tempo é o recurso mais escasso do Personal. O sistema deve impedir erros humanos de sobreposição.
2. **Prioridade de Bloqueio:**
    *   `Manual Block` > `Presencial Training` > `Availability`.
3. **Consultoria Online:** Funciona como uma 'camada fantasma' — não consome o slot físico, permitindo que o Personal tenha múltiplos alunos online ou atenda um presencial enquanto o online treina por conta própria.
4. **Resiliência:** Se o Personal alterar seu horário de trabalho para um período onde já existem treinos marcados, o sistema deve alertar sobre os "Treinos Órfãos".
