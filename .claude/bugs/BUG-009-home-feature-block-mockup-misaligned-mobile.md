# BUG-009 — Mockups do FeatureBlock desalinhados e colados no fundo em mobile

**Status:** `[x]` resolvido
**Prioridade:** MÉDIA
**Relatado em:** 2026-03-13
**Módulo:** `frontend/components/marketing/feature-block`

## 📝 Descrição do Bug

Na home page (`/`), os blocos de "feature" (seção Funcionalidades) exibem placeholders de mockup desalinhados e visualmente "colados" ao fundo em dispositivos móveis. O placeholder aparece sem centralização horizontal e sem espaçamento adequado em relação ao conteúdo de texto acima.

### Cenário de Reprodução:
1. Acessar `/` em um smartphone (< 768px de largura).
2. Rolar até a seção "Sua ficha de treino no próximo nível".
3. O bloco de mockup placeholder aparece desalinhado — sem centralização correta e com o fundo escuro da seção visível ao redor.

## 🔍 Causa Raiz

**Arquivo:** `frontend/src/components/marketing/feature-block.tsx` — linha 58

```tsx
{/* Image / Mockup Placeholder */}
<div className="relative flex-1">
  <div className="relative aspect-[4/3] w-full max-w-xl overflow-hidden ...">
```

Dois problemas combinados:

**Problema 1 — Largura sem centralização no mobile:**
O container externo `relative flex-1` não possui `w-full` nem `flex justify-center` quando o layout pai está em `flex-col` (mobile). Dentro de `flex-col items-center`, o `flex-1` toma toda a largura disponível, mas o filho `max-w-xl` não está centralizado — falta `mx-auto` no div interno.

**Problema 2 — Blobs decorativos fora do contexto de clipping:**
```tsx
<div className="absolute -right-10 -top-10 -z-10 h-40 w-40 rounded-full bg-primary/10 blur-3xl" />
<div className="absolute -bottom-10 -left-10 -z-10 h-40 w-40 rounded-full bg-primary/5 blur-3xl" />
```
Os blobs decorativos usam `absolute` com `-z-10` dentro de um container `overflow-hidden`. No mobile, com o layout empilhado em `flex-col`, o contexto de empilhamento muda e os blobs podem vazar para fora do container esperado, ficando visíveis "atrás" do fundo da seção.

## ✅ Critérios de Aceite

- [ ] Em telas < 768px, o bloco de mockup aparece centralizado horizontalmente sob o bloco de texto.
- [ ] Adicionar `mx-auto` no `div` interno (`aspect-[4/3] w-full max-w-xl ...`) para centralizar em mobile.
- [ ] Adicionar `w-full` no container externo para garantir que o `flex-1` se comporte corretamente no eixo cruzado.
- [ ] Os blobs decorativos não devem ser visíveis fora dos limites do card de mockup em nenhuma resolução.
- [ ] O alinhamento deve ser testado em 375px (iPhone SE), 390px (iPhone 14) e 414px (iPhone 14 Plus).
