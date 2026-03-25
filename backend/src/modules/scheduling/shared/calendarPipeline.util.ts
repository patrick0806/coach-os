import type { RecurringSlot } from "@shared/repositories/recurringSlots.repository";
import type { CalendarEvent } from "@shared/repositories/calendarEvents.repository";

export interface UnifiedCalendarEntry {
  id: string;
  source: "recurring_slot" | "calendar_event";
  startAt: Date;
  endAt: Date;
  studentId?: string | null;
  studentName?: string | null;
  type: "booking" | "block" | "one_off" | "override";
  status: "scheduled" | "cancelled" | "completed" | "no_show";
  appointmentType?: string | null;
  meetingUrl?: string | null;
  location?: string | null;
  notes?: string | null;
  recurringSlotId?: string | null;
  isOverride?: boolean;
}

export interface CalendarPipelineInput {
  recurringSlots: RecurringSlot[];
  calendarEvents: CalendarEvent[];
  startDate: Date;
  endDate: Date;
  studentNames?: Map<string, string>;
}

function toDateStr(date: Date): string {
  const y = date.getUTCFullYear();
  const m = (date.getUTCMonth() + 1).toString().padStart(2, "0");
  const d = date.getUTCDate().toString().padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function isSlotActiveOnDate(slot: RecurringSlot, dateStr: string): boolean {
  if (!slot.isActive) return false;
  if (slot.effectiveFrom > dateStr) return false;
  if (slot.effectiveTo && slot.effectiveTo < dateStr) return false;
  return true;
}

export function buildCalendar(input: CalendarPipelineInput): UnifiedCalendarEntry[] {
  const { recurringSlots, calendarEvents, startDate, endDate, studentNames } = input;
  const entries: UnifiedCalendarEntry[] = [];

  // Build override lookup: recurringSlotId + originalStartAt ISO -> event
  const overrideMap = new Map<string, CalendarEvent>();
  for (const event of calendarEvents) {
    if (event.type === "override" && event.recurringSlotId && event.originalStartAt) {
      const key = `${event.recurringSlotId}:${event.originalStartAt.toISOString()}`;
      overrideMap.set(key, event);
    }
  }

  // 1. Expand recurring slots into concrete instances
  const days: Date[] = [];
  const rangeEndDate = new Date(`${toDateStr(endDate)}T00:00:00Z`);
  for (let d = new Date(`${toDateStr(startDate)}T00:00:00Z`); d <= rangeEndDate; d = new Date(d.getTime() + 86400000)) {
    days.push(new Date(d));
  }

  for (const day of days) {
    const dayOfWeek = day.getUTCDay();
    const dateStr = toDateStr(day);

    for (const slot of recurringSlots) {
      if (slot.dayOfWeek !== dayOfWeek) continue;
      if (!isSlotActiveOnDate(slot, dateStr)) continue;

      // Compute the instance startAt for this date
      const instanceStartAt = new Date(`${dateStr}T${slot.startTime}:00Z`);
      const instanceEndAt = new Date(`${dateStr}T${slot.endTime}:00Z`);

      // Check for override on this instance
      const overrideKey = `${slot.id}:${instanceStartAt.toISOString()}`;
      const override = overrideMap.get(overrideKey);

      if (override) {
        if (override.status === "cancelled") {
          // Skip this instance (cancelled override)
          continue;
        }
        // Rescheduled override — add the override entry instead
        entries.push({
          id: override.id,
          source: "calendar_event",
          startAt: override.startAt,
          endAt: override.endAt,
          studentId: override.studentId,
          studentName: override.studentId ? studentNames?.get(override.studentId) ?? null : null,
          type: "override",
          status: override.status as "scheduled" | "cancelled" | "completed" | "no_show",
          appointmentType: override.appointmentType,
          meetingUrl: override.meetingUrl,
          location: override.location ?? slot.location,
          notes: override.notes,
          recurringSlotId: slot.id,
          isOverride: true,
        });
        continue;
      }

      // Normal instance — no override
      entries.push({
        id: `${slot.id}:${dateStr}`,
        source: "recurring_slot",
        startAt: instanceStartAt,
        endAt: instanceEndAt,
        studentId: slot.studentId,
        studentName: slot.studentId ? studentNames?.get(slot.studentId) ?? null : null,
        type: slot.type,
        status: "scheduled",
        location: slot.location,
        recurringSlotId: slot.id,
      });
    }
  }

  // 2. Add non-override calendar events (one_off + block)
  for (const event of calendarEvents) {
    if (event.type === "override") continue; // Already handled above

    entries.push({
      id: event.id,
      source: "calendar_event",
      startAt: event.startAt,
      endAt: event.endAt,
      studentId: event.studentId,
      studentName: event.studentId ? studentNames?.get(event.studentId) ?? null : null,
      type: event.type as "one_off" | "block",
      status: event.status as "scheduled" | "cancelled" | "completed" | "no_show",
      appointmentType: event.appointmentType,
      meetingUrl: event.meetingUrl,
      location: event.location,
      notes: event.notes,
      recurringSlotId: event.recurringSlotId,
    });
  }

  // 3. Sort by startAt
  entries.sort((a, b) => a.startAt.getTime() - b.startAt.getTime());

  return entries;
}
