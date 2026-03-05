# Epic 06 — Planos SaaS e Assinatura

Status: `[ ]` todo

---

## US-015 — Visualizar planos SaaS (publico)

**Status:** `[ ]` todo
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
- [ ] `GET /plans` — listar planos ativos (rota publica com `@Public()`)
- [ ] `PlansRepository` com metodo `findAllActive`
- [ ] Response DTO com campo `benefits` como `string[]` (deserializar do formato varchar)
- [ ] `list-plans.controller.spec.ts` + `list-plans.service.spec.ts`

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

**Status:** `[ ]` todo
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
- [ ] Migration para adicionar campos de assinatura em `personals`
- [ ] `POST /subscriptions/checkout` — criar sessao Stripe Checkout (retorna `checkoutUrl`)
- [ ] `POST /subscriptions/webhook` — processar eventos Stripe (rota publica, validar assinatura)
  - Eventos: `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`
- [ ] `GET /subscriptions/me` — status da assinatura atual do personal autenticado
- [ ] `POST /subscriptions/cancel` — solicitar cancelamento ao fim do periodo
- [ ] Atualizar `PersonalsRepository` com metodos de assinatura
- [ ] Unit tests para checkout e get
- [ ] Integration test para webhook (simular evento Stripe)

### Subtasks Frontend
- [ ] Rota: `/dashboard/subscription`
- [ ] Card com: plano atual, status, data de renovacao/expiracao
- [ ] Botao "Assinar" / "Trocar Plano" (redireciona para Stripe Checkout)
- [ ] Pagina de retorno apos checkout: `/dashboard/subscription/success` e `/dashboard/subscription/cancel`
- [ ] Exibir alerta quando assinatura esta proxima do vencimento ou expirada

### Notas Tecnicas
- Configurar `STRIPE_SECRET_KEY` e `STRIPE_WEBHOOK_SECRET` via `.env`
- Nunca expor a secret key no frontend — toda integracao Stripe via backend
- O webhook precisa receber o body raw (nao parseado) para validar a assinatura — configurar no Fastify/NestJS
- Stripe Price IDs mapeados por nome de plano em variaveis de ambiente: `STRIPE_PRICE_BASICO`, `STRIPE_PRICE_PRO`, `STRIPE_PRICE_EMPRESARIAL`
