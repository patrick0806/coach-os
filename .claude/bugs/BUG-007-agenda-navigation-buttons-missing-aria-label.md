# BUG-007 — Botões de navegação semanal da Agenda sem aria-label

**Status:** `[x]` resolvido
**Prioridade:** BAIXA
**Relatado em:** 2026-03-13
**Módulo:** `frontend/painel/agenda`

## 📝 Descrição do Bug

Os botões de navegação semanal (chevron esquerdo/direito) na página `/painel/agenda` não possuíam `aria-label`. Isso criava dois problemas:

1. **Acessibilidade:** Leitores de tela não conseguem descrever a ação dos botões ao usuário.
2. **Fragilidade nos testes E2E:** Os testes Playwright precisavam recorrer a seletor CSS frágil (`.mb-4.flex.items-center.gap-2`) para localizar o container de navegação e usar `.first()`/`.last()` para identificar os botões por posição, ao invés de nome acessível.

## 🔍 Causa Raiz

Os botões renderizavam apenas um ícone SVG sem texto visível ou atributo `aria-label`:

```tsx
// Antes
<Button variant="premium-ghost" size="sm" onClick={prevWeek}>
  <ChevronLeft className="size-4" />
</Button>
```

## ✅ Correções Aplicadas

**Arquivo:** `frontend/src/app/painel/agenda/page.tsx`

1. Adicionado `aria-label="Semana anterior"` e `aria-label="Próxima semana"` nos botões de chevron.
2. Adicionado `data-testid="week-nav"` no container `<div>` da navegação semanal.

**Arquivo:** `frontend/tests/e2e/personal-agenda.spec.ts`

1. Substituído seletor CSS frágil `.mb-4.flex.items-center.gap-2` por `page.getByTestId("week-nav")`.
2. Substituído `.first()` baseado em posição por `page.getByRole("button", { name: "Semana anterior" })`.
3. Adicionado teste para "Próxima semana" que estava ausente.
