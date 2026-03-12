# Épico 22 — Correções de Emergência e Fortalecimento de Segurança

**Status:** `[~]` in progress
**Prioridade:** CRÍTICA (Urgência Máxima)
**Responsáveis:** Harry Potter (Security), Dumbledore (Architect), Snape (Backend), Hermione (Frontend)

> **Objetivo:** Sanar vulnerabilidades críticas de segurança, corrigir falhas de isolamento de dados (tenant leaks) e eliminar bugs de lógica identificados no Code Review de 2026-03-12. Este épico tem precedência sobre qualquer nova funcionalidade.

---

## 🎙️ Perspectivas dos Especialistas

### ⚡ Harry Potter (Security & DevOps)
*"Temos um vazamento de credenciais AWS em logs de produção e segredos JWT inseguros por padrão. Isso é o equivalente a deixar a porta da Câmara Secreta aberta com um letreiro luminoso. Corrigir isso é o Nível 0."*

### 🧙‍♂️ Albus Dumbledore (Architect)
*"O isolamento de tenant em `ScheduleRulesRepository` é uma rachadura nos alicerces de Hogwarts. Um personal não pode ter visibilidade sobre os alunos de outro. Precisamos restaurar as barreiras mágicas imediatamente."*

### 🧪 Severus Snape (Backend)
*"O uso de `as any` nos repositórios é uma poção mal preparada. Estamos perdendo a segurança de tipos que o Drizzle nos oferece. Vou exigir rigor técnico na tipagem dos nossos inputs e outputs."*

### 📚 Hermione Granger (Frontend)
*"Existem componentes mortos e lógica duplicada no frontend que estão apenas ocupando espaço e confundindo os alunos. Vou limpar a biblioteca e unificar a lógica de parsing de tokens."*

---

## 📋 Histórias de Usuário e Tarefas Técnicas

### US-070 — [CRÍTICO] Segurança de Infraestrutura e Segredos (Nível 0) ✅
- [x] **Remover logs de credenciais AWS:** Limpar `console.log` em `s3.provider.ts`.
- [x] **Validar Variáveis de Ambiente:** Implementar validação Zod no `env/index.ts` para falhar rápido se segredos (JWT, Pepper, AWS) não forem definidos ou forem inseguros.
- [x] **Limpeza de Logs de Produção:** Revisar e remover `console.log` de variáveis de ambiente no `register.service.ts`.

---

### US-071 — [ALTO] Integridade de Isolamento (Multi-tenancy) (Nível 1) ✅
- [x] **Corrigir Tenant Leak em ScheduleRules:** Adicionado filtro de `personalId` no `findByStudent`. Teste regressivo criado.
- [x] **Auditoria de Tenant Guards:** 10 métodos corrigidos em `training-sessions`, `student-notes`, `exercises` e `schedule-rules`. 12 testes de repositório + 9 specs de service atualizados.

---

### US-072 — [MÉDIO] Correção de Bugs de Lógica e Dados (Nível 2) ✅
- [x] **Correção de Range de Datas:** Adicionado filtro `lte` no `findByStudentAndDateRange`.
- [x] **Desacoplar Nome de Plano Básico:** Campo `isDefault` no schema, migration `0018`, método `findDefault()` no `PlansRepository`, `register.service.ts` atualizado.
- [x] **Sincronização de Status de Assinatura:** `TenantAccessGuard` refatorado — `subscriptionStatus` (Stripe) tem precedência; sync é fire-and-forget eliminando race condition.

---

### US-073 — [MÉDIO] Qualidade de Código e Tipagem (Nível 3)
- [ ] **Eliminar `as any` nos Repositórios:** Tipar corretamente as operações do Drizzle, começando por `PersonalsRepository` e `TrainingSessionsRepository`.
- [ ] **Unificar Parsing de JWT:** Extrair `decodeAccessTokenPayload` para um utilitário compartilhado compatível com Edge Runtime.
- [ ] **Limpeza de Componentes Mortos:** Remover `component-example.tsx`, `example.tsx` e arquivos de barril vazios no frontend.

---

### US-074 — [BAIXO/ESTRATÉGICO] calculos complexos de datas (Nível 4)
- [ ] Onde tiver calculos de datas utilizar o datefns, trocar as implementações atuais para utilizar o datefns.

---

## 🚀 Recomendações de Execução
1. **Atacar o Nível 0 imediatamente:** Estes são riscos reais de segurança em produção.
2. **Validar com Testes:** Cada correção de bug (especialmente o leak de tenant) deve ser acompanhada de um teste unitário que comprove que a falha foi sanada.
3. **Padrão Drizzle:** Não silenciar o TypeScript; se o Drizzle reclamar, a tipagem do DTO ou do Schema provavelmente precisa de ajuste.
