import type { WorkingHours } from "@shared/repositories/workingHours.repository";
import type { UnifiedCalendarEntry } from "./calendarPipeline.util";

export interface AvailabilitySlot {
  startAt: Date;
  endAt: Date;
}

export interface AvailabilityInput {
  workingHours: WorkingHours[];
  calendarEntries: UnifiedCalendarEntry[];
  startDate: Date;
  endDate: Date;
}

function toDateStr(date: Date): string {
  const y = date.getUTCFullYear();
  const m = (date.getUTCMonth() + 1).toString().padStart(2, "0");
  const d = date.getUTCDate().toString().padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function normalizeToDateStr(value: string | Date): string {
  if (value instanceof Date) return toDateStr(value);
  return value.substring(0, 10);
}

function isWorkingHoursActiveOnDate(wh: WorkingHours, dateStr: string): boolean {
  if (!wh.isActive) return false;
  const from = normalizeToDateStr(wh.effectiveFrom);
  if (from > dateStr) return false;
  if (wh.effectiveTo) {
    const to = normalizeToDateStr(wh.effectiveTo);
    if (to < dateStr) return false;
  }
  return true;
}

function subtractIntervals(
  free: { start: number; end: number },
  busy: { start: number; end: number }[],
): { start: number; end: number }[] {
  let slots = [free];

  for (const b of busy) {
    const next: { start: number; end: number }[] = [];
    for (const s of slots) {
      // No overlap
      if (b.end <= s.start || b.start >= s.end) {
        next.push(s);
        continue;
      }
      // Left remainder
      if (b.start > s.start) {
        next.push({ start: s.start, end: b.start });
      }
      // Right remainder
      if (b.end < s.end) {
        next.push({ start: b.end, end: s.end });
      }
    }
    slots = next;
  }

  return slots;
}

export function computeAvailability(input: AvailabilityInput): AvailabilitySlot[] {
  const { workingHours, calendarEntries, startDate, endDate } = input;
  const result: AvailabilitySlot[] = [];

  // Iterate through each day in range
  const rangeEndDate = new Date(`${toDateStr(endDate)}T00:00:00Z`);
  for (let d = new Date(`${toDateStr(startDate)}T00:00:00Z`); d <= rangeEndDate; d = new Date(d.getTime() + 86400000)) {
    const dayOfWeek = d.getUTCDay();
    const dateStr = toDateStr(d);

    // Get working hours for this day
    const whForDay = workingHours.filter(
      (wh) => wh.dayOfWeek === dayOfWeek && isWorkingHoursActiveOnDate(wh, dateStr),
    );

    if (whForDay.length === 0) continue;

    // Get busy intervals for this day (non-cancelled entries)
    const dayStart = d.getTime();
    const dayEnd = dayStart + 86400000;

    const busyIntervals = calendarEntries
      .filter((e) => {
        if (e.status === "cancelled") return false;
        const eStart = e.startAt.getTime();
        const eEnd = e.endAt.getTime();
        return eStart < dayEnd && eEnd > dayStart;
      })
      .map((e) => ({
        start: e.startAt.getTime(),
        end: e.endAt.getTime(),
      }));

    // For each working hour window, subtract busy intervals
    for (const wh of whForDay) {
      const whStart = new Date(`${dateStr}T${wh.startTime}:00Z`).getTime();
      const whEnd = new Date(`${dateStr}T${wh.endTime}:00Z`).getTime();

      const freeSlots = subtractIntervals(
        { start: whStart, end: whEnd },
        busyIntervals,
      );

      for (const slot of freeSlots) {
        result.push({
          startAt: new Date(slot.start),
          endAt: new Date(slot.end),
        });
      }
    }
  }

  return result;
}
