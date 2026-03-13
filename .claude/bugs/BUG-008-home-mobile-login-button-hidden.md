# BUG-008 — Botão "Entrar" invisível no mobile na Home Page

**Status:** `[x]` resolvido
**Prioridade:** ALTA
**Relatado em:** 2026-03-13
**Módulo:** `frontend/components/marketing/navbar`

## 📝 Descrição do Bug

Na Navbar da home page (`/`), o link "Entrar" (para `/login`) está invisível em dispositivos móveis com largura de tela menor que 640px (smartphones). Não existe menu hamburguer nem nenhuma alternativa de navegação para login no mobile — o único botão visível é "Começar Grátis".

### Cenário de Reprodução:
1. Acessar `/` em um smartphone (< 640px de largura).
2. Observar a navbar: só aparece o logo e o botão "Começar Grátis".
3. O link "Entrar" para `/login` não existe em lugar algum da página no mobile.

## 🔍 Causa Raiz

**Arquivo:** `frontend/src/components/marketing/navbar.tsx` — linha 82

```tsx
<Link
  href="/login"
  className="hidden text-sm font-medium text-muted-foreground transition-colors hover:text-foreground sm:block"
>
  Entrar
</Link>
```

A classe `hidden sm:block` oculta o link abaixo de `sm` (640px). A navbar não possui menu hamburguer para mobile — os links de navegação (`hidden md:flex`) também são inacessíveis em telas pequenas.

## ✅ Critérios de Aceite

- [ ] Em telas < 640px, o usuário consegue acessar o link de login a partir da home page.
- [ ] Opção 1 (mínima): Alterar `hidden sm:block` para `block` — tornando o link sempre visível ao lado do botão "Começar Grátis".
- [ ] Opção 2 (completa): Implementar menu hamburguer mobile com os links de navegação e o link de login.
- [ ] O botão "Começar Grátis" deve permanecer visível em todas as resoluções.
