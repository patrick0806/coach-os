import type { WorkingHours } from "@shared/repositories/workingHours.repository";
import type { UnifiedCalendarEntry } from "./calendarPipeline.util";

export interface ConflictV2 {
  type: "outside_working_hours" | "overlap";
  message: string;
  details?: Record<string, unknown>;
}

export interface ConflictDetectionV2Input {
  proposedStartAt: Date;
  proposedEndAt: Date;
  workingHours: WorkingHours[];
  calendarEntries: UnifiedCalendarEntry[];
  excludeEventId?: string;
}

function toUtcTimeStr(date: Date): string {
  const h = date.getUTCHours().toString().padStart(2, "0");
  const m = date.getUTCMinutes().toString().padStart(2, "0");
  return `${h}:${m}`;
}

function toDateStr(date: Date): string {
  const y = date.getUTCFullYear();
  const m = (date.getUTCMonth() + 1).toString().padStart(2, "0");
  const d = date.getUTCDate().toString().padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function detectConflictsV2(input: ConflictDetectionV2Input): ConflictV2[] {
  const { proposedStartAt, proposedEndAt, workingHours, calendarEntries, excludeEventId } = input;
  const conflicts: ConflictV2[] = [];

  const dayOfWeek = proposedStartAt.getUTCDay();
  const startTime = toUtcTimeStr(proposedStartAt);
  const endTime = toUtcTimeStr(proposedEndAt);
  const dateStr = toDateStr(proposedStartAt);

  // 1. Check if within working hours
  const whForDay = workingHours.filter((wh) => {
    if (wh.dayOfWeek !== dayOfWeek || !wh.isActive) return false;
    if (wh.effectiveFrom > dateStr) return false;
    if (wh.effectiveTo && wh.effectiveTo < dateStr) return false;
    return true;
  });

  if (whForDay.length > 0) {
    const isWithinWorkingHours = whForDay.some(
      (wh) => startTime >= wh.startTime && endTime <= wh.endTime,
    );

    if (!isWithinWorkingHours) {
      conflicts.push({
        type: "outside_working_hours",
        message: "Time slot is outside working hours for this day",
        details: {
          dayOfWeek,
          workingHoursSlots: whForDay.map((wh) => ({
            startTime: wh.startTime,
            endTime: wh.endTime,
          })),
        },
      });
    }
  }

  // 2. Check for overlapping calendar entries
  const proposedStart = proposedStartAt.getTime();
  const proposedEnd = proposedEndAt.getTime();

  for (const entry of calendarEntries) {
    if (entry.status === "cancelled") continue;
    if (excludeEventId && entry.id === excludeEventId) continue;

    const entryStart = entry.startAt.getTime();
    const entryEnd = entry.endAt.getTime();

    if (proposedStart < entryEnd && proposedEnd > entryStart) {
      conflicts.push({
        type: "overlap",
        message: `Conflicts with existing ${entry.type} from ${toUtcTimeStr(entry.startAt)} to ${toUtcTimeStr(entry.endAt)}`,
        details: {
          entryId: entry.id,
          entryType: entry.type,
          studentId: entry.studentId,
        },
      });
    }
  }

  return conflicts;
}
