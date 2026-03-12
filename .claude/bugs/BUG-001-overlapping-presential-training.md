# BUG-001 — Sobreposição de Treinos Presenciais

**Status:** `[x]` done
**Prioridade:** ALTA
**Relatado em:** 2026-03-12
**Módulo:** `backend/training-schedule`

## 📝 Descrição do Bug
O sistema permite que um Personal Trainer cadastre múltiplos alunos para treinos do tipo `presential` no mesmo horário e dia da semana. Isso viola a regra de negócio básica de que um Personal (atendimento individual presencial) não pode estar em dois lugares ao mesmo tempo ou atendendo dois alunos simultaneamente em sessões individuais.

### Cenário de Reprodução:
1.  Acessar o detalhe da aluna **Maria**.
2.  No Planejador, definir Segunda-feira, das 10:00 às 11:00 como Treino Presencial. (Sucesso)
3.  Acessar o detalhe do aluno **Carlos**.
4.  No Planejador, definir Segunda-feira, das 10:00 às 11:00 como Treino Presencial. (O sistema permite incorretamente)

## 🔍 Causa Raiz (Análise Inicial)
No arquivo `backend/src/modules/training-schedule/contexts/upsert-schedule-rules/upsert-schedule-rules.service.ts`, o método `execute` valida se o horário está dentro da disponibilidade do personal (`isPresentialCoveredByAvailability`), mas **não valida** se já existe outra `ScheduleRule` do tipo `presential` ocupando aquele mesmo intervalo (ou parte dele) para o mesmo Personal.

## 🎯 Solução Proposta
1.  Criar um método no `ScheduleRulesRepository` para buscar regras conflitantes: `findConflictingRules(personalId, dayOfWeek, startTime, endTime, studentIdToExclude)`.
2.  No `UpsertScheduleRulesService`, chamar essa validação antes de realizar o `upsert`.
3.  Lançar um `ConflictException` ou `BadRequestException` caso haja sobreposição.

## ✅ Critérios de Aceite
- [ ] O sistema deve impedir o cadastro de um treino presencial que sobreponha (total ou parcialmente) outro treino presencial do mesmo Personal.
- [ ] O sistema deve permitir múltiplos treinos no mesmo horário caso o tipo seja `online`.
- [ ] Teste unitário cobrindo o cenário de sobreposição e o cenário de sucesso (sem sobreposição).
