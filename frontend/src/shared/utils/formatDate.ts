import { format } from "date-fns"
import { ptBR } from "date-fns/locale"

/** "dd/MM/yyyy" — e.g. "25/03/2026" */
export function formatShortDate(date: Date | string): string {
  return format(new Date(date), "dd/MM/yyyy", { locale: ptBR })
}

/** "dd 'de' MMMM 'de' yyyy" — e.g. "25 de março de 2026" */
export function formatLongDate(date: Date | string): string {
  return format(new Date(date), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })
}

/** "HH:mm" — e.g. "14:30" */
export function formatTime(date: Date | string): string {
  return format(new Date(date), "HH:mm")
}

/** "dd/MM/yyyy 'às' HH:mm" — e.g. "25/03/2026 às 14:30" */
export function formatDateTime(date: Date | string): string {
  return format(new Date(date), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })
}
