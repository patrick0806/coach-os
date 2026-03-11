# Epic 12 — Institucional, Compliance e Conversão

Status: `[ ]` todo

> **Visão de Produto (Minerva):** Um SaaS profissional deve equilibrar funcionalidade com autoridade. A Home Page é o "aperto de mão" inicial; se ela não for impecável e as páginas legais não estiverem presentes, o Personal Trainer (nosso cliente) não confiará os dados de seus alunos à nossa plataforma. Manteremos o design Dark/Moderno atual, mas elevando a sofisticação.

---

## US-033 — Expansão do Marketing (Funcionalidades e Sobre)

### Status: `[x]` done

...

### Tasks
- [x] Criar `frontend/src/app/(marketing)/layout.tsx`.
- [x] Implementar `frontend/src/app/(marketing)/funcionalidades/page.tsx`.
- [x] Implementar `frontend/src/app/(marketing)/sobre/page.tsx`.

---

## US-034 — Compliance e Segurança Jurídica (Termos e Privacidade)

### Status: `[x]` done

...

### Tasks
- [x] Criar `frontend/src/app/(legal)/termos/page.tsx`.
- [x] Criar `frontend/src/app/(legal)/privacidade/page.tsx`.

---

## US-035 — Suporte e Atendimento (FAQ e Contato)

### User Problem
Dúvidas pré-venda ou problemas técnicos sem canal de saída geram desistência e reclamações externas.

### Product Goal
Centralizar o suporte e reduzir o custo operacional de atendimento.

### Suggested Feature
Página de FAQ com Accordions e Formulário de Contato integrado ao backend.

### Priority: Medium | Impact: High

### Tasks Backend
- [ ] `POST /support/contact`: Endpoint para envio de e-mail interno via Resend.

### Tasks Frontend
- [ ] Criar `frontend/src/app/(support)/faq/page.tsx`.
- [ ] Criar `frontend/src/app/(support)/contato/page.tsx`.

---

## US-036 — Otimização de Conversão da Home Page (Refinement)

### Status: `[x]` done

...

### Tasks Frontend
- [x] Refatorar `frontend/src/app/page.tsx` para utilizar os novos componentes.
- [x] Criar `frontend/src/components/marketing/navbar.tsx`.
- [x] Criar `frontend/src/components/marketing/footer.tsx`.
- [x] Criar `frontend/src/components/marketing/feature-block.tsx`.
