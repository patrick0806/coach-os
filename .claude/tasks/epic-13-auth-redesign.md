# Épico 13 — Redesign de Autenticação e Recuperação de Senha

Status: `[x]` done

> **Visão de Produto (Minerva):** A primeira impressão é a que fica. As páginas de login e cadastro devem transmitir a mesma autoridade e sofisticação da nossa Home Page e páginas institucionais. Além disso, a ausência de um fluxo de recuperação de senha é um ponto crítico de experiência do usuário (UX) que precisamos resolver para garantir a autonomia dos nossos clientes e seus alunos.

---

## US-037 — Redesign das Páginas de Login e Cadastro

### User Problem
As páginas atuais, embora funcionais, possuem um design simplificado que não reflete o posicionamento "Premium" do Coach OS.

### Product Goal
Elevar o padrão visual das páginas de entrada para aumentar a taxa de conversão e reforçar a identidade de marca.

### Design Strategy (Luna)
- Manter o **Dark Mode** obrigatório para alinhar com as páginas institucionais e de suporte.
- Utilizar fundos mais sofisticados (Mesh gradients, padrões sutis de grade/dots).
- Melhorar o feedback visual dos formulários (estados de foco, erro, sucesso).
- Adicionar elementos de prova social ou benefícios rápidos nos painéis laterais (desktop).
- Responsividade "Mobile First" impecável.

### Tasks Frontend
- [x] Refatorar `frontend/src/app/(auth)/login/page.tsx` com novo design.
- [x] Refatorar `frontend/src/app/(auth)/cadastro/page.tsx` com novo design.
- [x] Mover/Remover `frontend/src/app/(auth)/register/` (limpeza técnica).
- [x] Criar componente compartilhado de `AuthLayout` para consistência.

---

## US-038 — Fluxo de Recuperação de Senha (Esqueci minha senha)

### User Problem
Usuários que esquecem a senha não têm um meio automatizado de recuperá-la, gerando tickets de suporte desnecessários.

### Product Goal
Automatizar a recuperação de senha com segurança via e-mail.

### Tasks Backend
- [x] `POST /auth/forgot-password`: Solicitar recuperação (gera token e envia e-mail).
- [x] `POST /auth/reset-password`: Redefinir senha usando o token.
- [x] Criar repositório `PasswordResetTokensRepository` (ou reutilizar lógica de `PasswordSetupTokens`).
- [x] Integrar com Resend para envio do link de recuperação.

### Tasks Frontend
- [x] Criar `frontend/src/app/(auth)/recuperar-senha/page.tsx` (Solicitação).
- [x] Criar `frontend/src/app/(auth)/redefinir-senha/page.tsx` (Nova senha).
- [x] Adicionar link "Esqueci minha senha" na página de login.

---

## US-039 — Melhorias de UX no Cadastro

### Product Goal
Tornar o cadastro mais fluido e informativo.

### Tasks
- [x] Adicionar máscaras de campos se necessário (embora cadastro inicial seja apenas nome/email/senha).
- [x] Melhorar a validação de força da senha visualmente.
- [x] Garantir que o redirect pós-cadastro/login seja suave com animações de transição.
