# Epic 17 — Excelência em Testes e Garantia de Qualidade (Backend)

Status: `[ ]` todo

> **Objetivo:** Garantir que o Coach OS seja resiliente a falhas e regressões, aumentando a cobertura de testes unitários e introduzindo testes de integração ponta a ponta (E2E) em ambiente local, além de automatizar a validação antes de cada commit.

---

## US-050 — Expansão da Cobertura Unitária e Casos de Borda

**Status:** `[ ]` todo
**Sprint:** 17

**Descrição:**
Aumentar a profundidade dos testes unitários existentes para cobrir cenários de erro e casos de borda em serviços críticos.

### Critérios de Aceite
- [ ] Adicionar testes para erros de validação complexos (Zod) em DTOs.
- [ ] Cobrir cenários de falha em transações de banco de dados (rollback manual/automático).
- [ ] Testar limites de planos (ex: personal free tentando criar o 11º aluno).
- [ ] Garantir cobertura mínima de 90% nos módulos de `auth`, `personals` e `subscriptions`, `workouts`, `bookings` e `students`.

---

## US-051 — Testes de Integração em Ambiente Local (Docker/TestDB)

**Status:** `[ ]` todo
**Sprint:** 17

**Descrição:**
Implementar testes de integração que validem a comunicação real com o PostgreSQL em ambiente isolado
e tudo deve ser executado com apenas um comando de script, caso opte por um docker ou docker-compose deve 
ser finalizado o docker-compose.test.yml também para não ficar segurando recursos.

### Critérios de Aceite
- [ ] Configurar `docker-compose.test.yml` para levantar um banco PostgreSQL efêmero.
- [ ] Criar utilitário `setupTestDB` para limpar e rodar migrations antes de cada suíte de teste de integração.
- [ ] Implementar testes de fluxo real: Registro → Login → Criar Treino → Atribuir Aluno.
- [ ] Garantir que segredos e variáveis de ambiente de teste sejam isolados (ex: `.env.test`).

---

## US-052 — Automação Preventiva (Git Hooks & CI Simulado)

**Status:** `[ ]` todo
**Sprint:** 17

**Descrição:**
Impedir que código com falhas ou baixa qualidade seja enviado ao repositório.

### Critérios de Aceite
- [ ] Instalar e configurar `husky` e `lint-staged` no backend.
- [ ] Configurar hook `pre-push` para rodar `npm run test` e `npm run test:e2e`.
- [ ] O comando de push deve ser bloqueado se qualquer teste falhar ou se o lint acusar erros graves.
- [ ] Criar script `npm run check:all` que unifica lint, typecheck e testes para rodar localmente com facilidade.
