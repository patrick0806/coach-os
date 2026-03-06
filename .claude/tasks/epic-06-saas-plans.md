# Epic 06 — Planos SaaS e Assinatura

Status: `[~]` in progress

---

## US-015 — Visualizar planos SaaS (publico)

**Status:** `[x]` done (backend)
**Sprint:** 5
**Dependencias:** nenhuma (dados ja existem no seed)

**Descricao:**
Como visitante ou profissional nao cadastrado, quero visualizar os planos de assinatura da plataforma para escolher o melhor plano antes de me registrar.

### Criterios de Aceite
- [ ] Listar planos ativos ordenados pelo campo `order`
- [ ] Exibir: nome, descricao, preco, beneficios (array), destaque (`highlighted`)
- [ ] Rota publica (sem autenticacao)
- [ ] Destaque visual para o plano com `highlighted: true`

### Diretivas de Implementacao
- Modulo: `src/modules/plans/`
- Context: `list-plans/`
- `PlansRepository`

### Subtasks Backend
- [x] `GET /plans` — listar planos ativos (rota publica com `@Public()`)
- [x] `PlansRepository` com metodo `findAllActive`
- [x] Response DTO com campo `benefits` como `string[]` (json nativo no schema)
- [x] `list-plans.controller.spec.ts` + `list-plans.service.spec.ts`

### Subtasks Frontend
- [ ] Secao na home (`/`) ou rota dedicada `/plans`
- [ ] Cards de pricing table responsivos
- [ ] Destaque visual (borda, badge "Recomendado") para `highlighted: true`
- [ ] Lista de beneficios com icone de check
- [ ] Botao CTA redirecionando para `/register`

### Notas Tecnicas
- O campo `benefits` no banco e um varchar com itens separados por virgula (toString() do seed) — parsear no backend antes de retornar
- Os 3 planos do seed: Basico (R$19,90 / 3 alunos), Pro (R$29,90 / 10 alunos), Empresarial (R$49,90 / ilimitado)

---

## US-016 — Personal assina um plano (Stripe)

**Status:** `[x]` done (backend)
**Sprint:** 5
**Dependencias:** US-001, US-015

**Descricao:**
Como personal trainer, quero assinar um plano de uso da plataforma para liberar meu acesso completo ao sistema.

### Criterios de Aceite
- [ ] Integracao com Stripe Checkout (sessao de pagamento hosteada pelo Stripe)
- [ ] Planos mapeados para Stripe Price IDs via variaveis de ambiente
- [ ] Webhook do Stripe atualiza status da assinatura no banco
- [ ] E-mail de confirmacao de assinatura bem-sucedida
- [ ] Cancelamento de assinatura possivel
- [ ] Personal com assinatura expirada tem acesso bloqueado (com mensagem clara)

### Diretivas de Implementacao
- Contexts: `subscriptions/checkout/`, `subscriptions/webhook/`, `subscriptions/get/`, `subscriptions/cancel/`
- Adicionar campos em `personals`: `stripeCustomerId`, `stripeSubscriptionId`, `subscriptionStatus`, `subscriptionPlanId`, `subscriptionExpiresAt`
- Criar nova migration para esses campos
- Webhook deve ser rota `@Public()` com validacao de `stripe-signature` header

### Subtasks Backend
- [x] Migration para adicionar campos de assinatura em `personals`
- [x] `POST /subscriptions/checkout` — criar sessao Stripe Checkout (retorna `checkoutUrl`)
- [x] `POST /subscriptions/webhook` — processar eventos Stripe (rota publica, validar assinatura)
  - Eventos: `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`
- [x] `GET /subscriptions/me` — status da assinatura atual do personal autenticado
- [x] `POST /subscriptions/cancel` — solicitar cancelamento ao fim do periodo
- [x] Atualizar `PersonalsRepository` com metodos de assinatura
- [x] Unit tests para checkout, webhook, get e cancel
- [ ] Integration test para webhook (simular evento Stripe)

### Subtasks Frontend
- [ ] Rota: `/dashboard/subscription`
- [ ] Card com: plano atual, status, data de renovacao/expiracao
- [ ] Botao "Assinar" (redireciona para Stripe Checkout para quem nao tem plano)
- [ ] Pagina de retorno apos checkout: `/dashboard/subscription/success` e `/dashboard/subscription/cancel`
- [ ] Exibir alerta quando assinatura esta proxima do vencimento ou expirada

### Notas Tecnicas
- Configurar `STRIPE_SECRET_KEY` e `STRIPE_WEBHOOK_SECRET` via `.env`
- Nunca expor a secret key no frontend — toda integracao Stripe via backend
- O webhook precisa receber o body raw (nao parseado) para validar a assinatura — configurar no Fastify/NestJS
- Stripe Price IDs mapeados por nome de plano em variaveis de ambiente: `STRIPE_PRICE_BASICO`, `STRIPE_PRICE_PRO`, `STRIPE_PRICE_EMPRESARIAL`

---

## US-017 — Gerenciar assinatura e uso (Personal)

**Status:** `[x]` done (backend)
**Sprint:** 6
**Dependencias:** US-016

**Descricao:**
Como personal trainer, quero gerenciar minha assinatura e visualizar o uso dos meus limites para decidir sobre upgrades ou cancelamentos.

### Criterios de Aceite
- [ ] Visualizar indicadores de uso atual vs. limite do plano (ex: "4 de 10 alunos utilizados")
- [ ] Listar planos superiores disponiveis para upgrade imediato
- [ ] Integracao com Stripe Customer Portal para gestao de metodos de pagamento e historico de faturas
- [ ] Fluxo de cancelamento de assinatura com confirmacao (mantendo acesso ate o fim do ciclo pago)
- [ ] Upgrade de plano com calculo de prorata automatico pelo Stripe

### Diretivas de Implementacao
- Contexts: `subscriptions/usage/`, `subscriptions/portal/`, `subscriptions/upgrade/`
- Adicionar logica de contagem de alunos ativos no `StudentsRepository`

### Subtasks Backend
- [x] `GET /subscriptions/usage` — retorna dados de uso (alunos cadastrados vs limite do plano atual)
- [x] `POST /subscriptions/portal` — gera URL para o Stripe Customer Portal (gestao de cartao/faturas)
- [x] `POST /subscriptions/upgrade` — endpoint para trocar para um plano superior (atualiza no Stripe com `proration_behavior: 'always_invoice'`)
- [x] `DELETE /subscriptions/cancel` — coberto pelo `POST /subscriptions/cancel` ja implementado na US-016
- [x] `maxStudents` adicionado ao schema de `plans` (migration 0003) + seed atualizado
- [x] `countActiveByPersonal` adicionado ao `StudentsRepository`
- [x] Unit tests para usage, portal e upgrade

### Subtasks Frontend
- [ ] Tela de Gestao: `/dashboard/subscription/manage`
- [ ] Componente de Barra de Progresso para limite de alunos
- [ ] Lista de cards para Upgrade (exibindo apenas planos superiores ao atual)
- [ ] Botao "Gerenciar Pagamentos" que abre o link do Stripe Portal em nova aba
- [ ] Modal de confirmacao para cancelamento de assinatura

### Notas Tecnicas
- O limite de alunos deve ser validado no Backend ao tentar criar um novo aluno (US-007)
- Utilizar `stripe.billingPortal.sessions.create` para o link de gestao externa
- No upgrade, o Stripe cobra a diferenca proporcional imediatamente ou na proxima fatura conforme configuracao do produto.
