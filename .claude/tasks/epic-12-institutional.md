# Epic 12 — Institucional, Compliance e Conversão

Status: `[ ]` todo

> **Visão de Produto (Minerva):** Um SaaS profissional deve equilibrar funcionalidade com autoridade. A Home Page é o "aperto de mão" inicial; se ela não for impecável e as páginas legais não estiverem presentes, o Personal Trainer (nosso cliente) não confiará os dados de seus alunos à nossa plataforma. Manteremos o design Dark/Moderno atual, mas elevando a sofisticação.

---

## US-033 — Expansão do Marketing (Funcionalidades e Sobre)

### User Problem
O visitante entende *o que* o Coach OS é, mas não vê *como* ele funciona na prática antes de se cadastrar.

### Product Goal
Demonstrar as capacidades do sistema de forma visual e humanizar a marca.

### Suggested Feature
Criar rotas `/funcionalidades` e `/sobre` seguindo o design system da Home (Dark, blur backgrounds, Lucide icons).

### Priority: High | Impact: High

### Critérios de Aceite
- [ ] Rota `/funcionalidades` com seções de "Zebra" (Texto de um lado, imagem/mockup do outro).
- [ ] Rota `/sobre` com layout de story-telling sobre a eficiência no treinamento.
- [ ] Layout compartilhado `(marketing)/layout.tsx` para garantir Navbar e Footer consistentes.

### Tasks
- [ ] Criar `frontend/src/app/(marketing)/layout.tsx`.
- [ ] Implementar `frontend/src/app/(marketing)/funcionalidades/page.tsx`.
- [ ] Implementar `frontend/src/app/(marketing)/sobre/page.tsx`.

---

## US-034 — Compliance e Segurança Jurídica (Termos e Privacidade)

### User Problem
Usuários profissionais temem por LGPD e segurança de dados. Sem termos claros, a barreira de entrada é maior.

### Product Goal
Proteção jurídica do SaaS e transparência total com o usuário.

### Suggested Feature
Páginas de texto longo com tipografia otimizada para leitura (prose).

### Priority: High | Impact: Medium

### Critérios de Aceite
- [ ] Rotas `/termos` e `/privacidade`.
- [ ] Componente `LegalContent` para renderizar os textos com largura máxima de leitura e espaçamento adequado.
- [ ] Links obrigatórios no Footer.

### Tasks
- [ ] Criar `frontend/src/app/(legal)/termos/page.tsx`.
- [ ] Criar `frontend/src/app/(legal)/privacidade/page.tsx`.

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

### User Problem
A Home Page atual é funcional, mas carece de uma narrativa de venda convincente. As funcionalidades estão escondidas e a Navbar é estática.

### Product Goal
Transformar a Home em uma máquina de conversão mais profissional e "viva".

### Suggested Feature
Refatoração da Home Page mantendo o estilo Dark, mas adicionando:
1. **Sticky Navbar:** Sempre visível com links (Funcionalidades, Preços, Sobre, Login).
2. **Seção "Features em Detalhe":** Substituir os 3 cards pequenos por blocos grandes de benefícios.
3. **Seção de Prova Social:** Placeholder para depoimentos ou números da plataforma.
4. **Footer Profissional:** Com colunas de links, logo e redes sociais.
5. **Final CTA:** Uma seção de encerramento impactante antes do footer.

### Priority: High | Impact: Ultra

### Critérios de Aceite
- [ ] Navbar fixa no topo com efeito backdrop-blur.
- [ ] Seção de "Features" com 3 blocos alternados (Gestão de Alunos, Montagem de Treino, Agenda).
- [ ] Botão de CTA flutuante ou bem distribuído pela página.
- [ ] Footer atualizado com 4 colunas (Produto, Empresa, Suporte, Legal).

### Tasks Frontend
- [ ] Refatorar `frontend/src/app/page.tsx` para utilizar os novos componentes.
- [ ] Criar `frontend/src/components/marketing/navbar.tsx`.
- [ ] Criar `frontend/src/components/marketing/footer.tsx`.
- [ ] Criar `frontend/src/components/marketing/feature-block.tsx`.
