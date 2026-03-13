import {
  format,
  addDays,
  differenceInDays,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  startOfDay,
  isToday,
  isBefore,
} from "date-fns";
import { ptBR } from "date-fns/locale";

/** Returns today's date as YYYY-MM-DD string (local time, no timezone shift) */
export function todayIso(): string {
  return format(new Date(), "yyyy-MM-dd");
}

/** Parses a YYYY-MM-DD string into a local Date (noon to avoid DST issues) */
export function parseIsoDate(dateStr: string): Date {
  const [year, month, day] = dateStr.split("-").map(Number);
  return new Date(year, month - 1, day, 12, 0, 0);
}

/** Formats a Date to YYYY-MM-DD */
export function formatIsoDate(date: Date): string {
  return format(date, "yyyy-MM-dd");
}

/** Returns the next N days starting from a YYYY-MM-DD string (inclusive) */
export function generateNextNDays(startDateStr: string, n: number): string[] {
  const start = parseIsoDate(startDateStr);
  return Array.from({ length: n }, (_, i) => formatIsoDate(addDays(start, i)));
}

/** Returns Monday–Sunday bounds for the week containing `ref` */
export function getWeekBounds(ref: Date): { from: string; to: string; label: string } {
  const monday = startOfWeek(ref, { weekStartsOn: 1 });
  const sunday = endOfWeek(ref, { weekStartsOn: 1 });
  const label = `${format(monday, "dd MMM", { locale: ptBR })} – ${format(sunday, "dd MMM yyyy", { locale: ptBR })}`;
  return {
    from: formatIsoDate(monday),
    to: formatIsoDate(sunday),
    label,
  };
}

/** Formats a date header: "Hoje, terça-feira, 12 de março" or "terça-feira, 12 de março" */
export function formatDateHeader(dateStr: string): string {
  const date = parseIsoDate(dateStr);
  const formatted = format(date, "EEEE, dd 'de' MMMM", { locale: ptBR });
  return isToday(date) ? `Hoje, ${formatted}` : formatted;
}

/** Formats a YYYY-MM-DD string to pt-BR short date: "12/03/2026" */
export function formatShortDate(dateStr: string): string {
  return format(parseIsoDate(dateStr), "dd/MM/yyyy");
}

/** Day abbreviation in pt-BR: "Dom", "Seg", "Ter", etc. */
export function getDayAbbr(dateStr: string): string {
  return format(parseIsoDate(dateStr), "EEE", { locale: ptBR }).replace(".", "");
}

/** Day number padded: "01", "12", etc. */
export function getDayNum(dateStr: string): string {
  return format(parseIsoDate(dateStr), "dd");
}

/** Calculates difference in days between two YYYY-MM-DD strings */
export function diffInDays(fromStr: string, toStr: string): number {
  return differenceInDays(parseIsoDate(toStr), parseIsoDate(fromStr));
}

/** Returns true if a YYYY-MM-DD string is today (local time) */
export function isIsoToday(dateStr: string): boolean {
  return isToday(parseIsoDate(dateStr));
}

/** Returns true if a YYYY-MM-DD string is in the past (before today) */
export function isIsoPast(dateStr: string): boolean {
  return isBefore(startOfDay(parseIsoDate(dateStr)), startOfDay(new Date()));
}

/** Calculates days remaining until a future Date (0 if today, negative if past) */
export function daysUntil(date: Date): number {
  return differenceInDays(startOfDay(date), startOfDay(new Date()));
}

/** Builds all dates (YYYY-MM-DD[]) for a date range, filtered by days of week */
export function buildRecurringDates(
  daysOfWeek: number[],
  startDateStr: string,
  endDateStr: string,
): string[] {
  if (!startDateStr || !endDateStr || daysOfWeek.length === 0) return [];
  const selectedDays = new Set(daysOfWeek);
  const start = parseIsoDate(startDateStr);
  const end = parseIsoDate(endDateStr);
  if (isBefore(end, start)) return [];
  const allDays = eachDayOfInterval({ start, end });
  return allDays
    .filter((d) => selectedDays.has(d.getDay()))
    .map(formatIsoDate);
}
