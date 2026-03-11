# Epic 17 — Checkout Transparente e Conversão SaaS

Status: `[ ]` todo

> **Objetivo:** Criar um fluxo de conversão impecável, desde a escolha do plano na landing page até o pagamento com cartão de crédito via Stripe Elements, garantindo a idempotência e uma experiência fluida para o personal trainer. Com mesmo nivel de elegancia e estilo do resto das páginas do sistema, principalmente a home, login e cadastro.

---

## US-047 — Persistência de Escolha de Plano no Cadastro

**Status:** `[x]` done
**Sprint:** 17

**Descrição:**
O plano selecionado na Landing Page deve ser persistido durante o processo de criação de conta para que o usuário seja levado ao checkout correto imediatamente após o login.

### Critérios de Aceite
- [x] Ao clicar em "Assinar" em um plano na Home, passar o `planId` via query param (ex: `/cadastro?plan=plan_premium`).
- [x] O formulário de cadastro deve ler o `planId` e armazená-lo temporariamente (Cookie ou SessionStorage).
- [x] Após a criação de conta bem-sucedida, redirecionar o usuário para `/painel/checkout` (se plano selecionado !== "basico"(plano basico pode ser testado por 30 dias sem cartão de crédito)).

---

## US-048 — Checkout Transparente com Stripe Elements (Cartão de Crédito)

**Status:** `[ ]` todo
**Sprint:** 17

**Descrição:**
Implementar a interface de pagamento diretamente no nosso frontend usando Stripe Elements, evitando redirecionamentos externos e aumentando a conversão.

### Critérios de Aceite
- [ ] Integrar `@stripe/stripe-js` e `@stripe/react-stripe-js` no frontend.
- [ ] Criar componente `StripeCheckoutForm` para captura segura de dados de cartão de crédito.
- [ ] Exibir resumo do plano selecionado, valor mensal e periodicidade no checkout.
- [ ] Implementar estados de carregamento e validação de erros do cartão em tempo real (inline).

---

## US-049 — Processamento Robusto e Idempotência (Backend Integration)

**Status:** `[ ]` todo
**Sprint:** 17

**Descrição:**
Garantir que o pagamento seja processado corretamente, sem cobranças duplicadas em caso de instabilidade de rede.

### Critérios de Aceite
- [ ] O frontend deve gerar um `clientSecret` chamando o backend antes de renderizar o Element.
- [ ] Enviar cabeçalho `stripe-idempotency-key` (usando o ID da sessão do usuário ou um UUID gerado) em todas as chamadas de transação.
- [ ] Tratar webhooks do Stripe (`invoice.paid`, `customer.subscription.deleted`) para atualizar o status do personal no nosso banco de dados.
- [ ] Redirecionar para `/painel/sucesso` com feedback visual de ativação imediata.
