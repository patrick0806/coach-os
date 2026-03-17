// Single Intl.NumberFormat instance — avoids repeated instantiation across renders.
const formatter = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});

/**
 * Formats a number as Brazilian Real (BRL).
 *
 * @example
 * formatMoney(29.9)  // "R$ 29,90"
 * formatMoney(0)     // "R$ 0,00"
 */
export function formatMoney(value: number): string {
  return formatter.format(value);
}
