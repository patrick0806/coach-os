/**
 * Returns today's date string (YYYY-MM-DD) in Brazil timezone (America/Sao_Paulo).
 * Using Brazil timezone avoids UTC midnight edge cases for users in UTC-3.
 */
export function getTodayInBrazil(): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "America/Sao_Paulo" }).format(new Date());
}
