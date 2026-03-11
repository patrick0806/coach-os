# Epic 16 — Excelência em Testes e Garantia de Qualidade

Status: `[ ]` todo

> **Objetivo:** Garantir que o Coach OS seja resiliente a falhas e regressões, aumentando a cobertura de testes unitários e introduzindo testes de integração ponta a ponta (E2E) em ambiente local, além de automatizar a validação antes de cada commit.

---

## US-050 — Expansão da Cobertura Unitária e Casos de Borda

**Status:** `[ ]` todo
**Sprint:** 16

**Descrição:**
Aumentar a profundidade dos testes unitários existentes para cobrir cenários de erro e casos de borda em serviços críticos.

### Critérios de Aceite
- [ ] Adicionar testes para erros de validação complexos (Zod) em DTOs.
- [ ] Cobrir cenários de falha em transações de banco de dados (rollback manual/automático).
- [ ] Testar limites de planos (ex: personal free tentando criar o 11º aluno).
- [ ] Garantir cobertura mínima de 90% nos módulos de `auth`, `personals` e `subscriptions`.

---

## US-051 — Testes de Integração em Ambiente Local (Docker/TestDB)

**Status:** `[ ]` todo
**Sprint:** 16

**Descrição:**
Implementar testes de integração que validem a comunicação real com o PostgreSQL e Redis em ambiente isolado.

### Critérios de Aceite
- [ ] Configurar `docker-compose.test.yml` para levantar um banco PostgreSQL efêmero.
- [ ] Criar utilitário `setupTestDB` para limpar e rodar migrations antes de cada suíte de teste de integração.
- [ ] Criar script unificado para rodar os testes de integração (ex: `npm run test:integration:local` ou similar) que:
  - Suba os containers necessários via docker-compose.
  - Aguarde a base estar pronta.
  - Rode os testes de integração.
  - Ao finalizar (com sucesso ou falha), limpe a base de testes e encerre o docker-compose para liberar processamento.
- [ ] Implementar testes de fluxo real: Registro → Login → Criar Treino → Atribuir Aluno.
- [ ] Garantir que segredos e variáveis de ambiente de teste sejam isolados (ex: `.env.test`).

---

## US-052 — Automação Preventiva (Git Hooks & CI Simulado)

**Status:** `[ ]` todo
**Sprint:** 16

**Descrição:**
Impedir que código com falhas ou baixa qualidade seja enviado ao repositório.

### Critérios de Aceite
- [ ] Instalar e configurar `husky` e `lint-staged` no backend.
- [ ] Configurar hook `pre-push` para rodar `npm run test` e `npm run test:e2e`.
- [ ] O comando de push deve ser bloqueado se qualquer teste falhar ou se o lint acusar erros graves.
- [ ] Criar script `npm run check:all` que unifica lint, typecheck e testes para rodar localmente com facilidade.

---

## US-053 — Testes E2E no Frontend com Playwright

**Status:** `[ ]` todo
**Sprint:** 16

**Descrição:**
Adotar testes end-to-end (E2E) no frontend utilizando Playwright para garantir a qualidade do fluxo do usuário e a responsividade da interface.

### Critérios de Aceite
- [ ] Configurar Playwright no projeto frontend.
- [ ] Implementar testes de fluxo crítico (Login, Cadastro, Navegação no Painel).
- [ ] Adicionar testes de responsividade (Mobile vs Desktop) para garantir que a UI se adapta corretamente aos diferentes tamanhos de tela.
- [ ] Validar fluxos de uso comuns para garantir que não existam regressões visuais ou de comportamento.
- [ ] Integrar os testes E2E no fluxo de validação local.
