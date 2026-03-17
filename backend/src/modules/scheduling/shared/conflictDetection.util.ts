import type { AvailabilityRule } from "@shared/repositories/availabilityRules.repository";
import type { AvailabilityException } from "@shared/repositories/availabilityExceptions.repository";
import type { Appointment } from "@shared/repositories/appointments.repository";
import type { TrainingSchedule } from "@shared/repositories/trainingSchedules.repository";
function toUtcTimeStr(date: Date): string {
  const h = date.getUTCHours().toString().padStart(2, "0");
  const m = date.getUTCMinutes().toString().padStart(2, "0");
  return `${h}:${m}`;
}

function toUtcDateStr(date: Date): string {
  const y = date.getUTCFullYear();
  const m = (date.getUTCMonth() + 1).toString().padStart(2, "0");
  const d = date.getUTCDate().toString().padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export interface Conflict {
  type: "exception" | "outside_availability" | "appointment" | "training_schedule";
  message: string;
  details?: Record<string, unknown>;
}

export interface ConflictDetectionInput {
  date: Date;
  startTime: string;
  endTime: string;
  availabilityRules: AvailabilityRule[];
  availabilityExceptions: AvailabilityException[];
  existingAppointments: Appointment[];
  trainingSchedules: TrainingSchedule[];
}

export function detectConflicts(input: ConflictDetectionInput): Conflict[] {
  const conflicts: Conflict[] = [];
  const dateStr = toUtcDateStr(input.date);
  const dayOfWeek = input.date.getUTCDay();

  // 1. Check if date falls on an availability exception
  const exceptionOnDate = input.availabilityExceptions.find(
    (e) => e.exceptionDate === dateStr,
  );
  if (exceptionOnDate) {
    conflicts.push({
      type: "exception",
      message: `Coach is unavailable on ${dateStr}${exceptionOnDate.reason ? `: ${exceptionOnDate.reason}` : ""}`,
      details: { exceptionId: exceptionOnDate.id },
    });
  }

  // 2. Check if time falls within availability rules for that day
  const rulesForDay = input.availabilityRules.filter(
    (r) => r.dayOfWeek === dayOfWeek && r.isActive,
  );

  if (rulesForDay.length > 0) {
    const isWithinAvailability = rulesForDay.some(
      (rule) => input.startTime >= rule.startTime && input.endTime <= rule.endTime,
    );

    if (!isWithinAvailability) {
      conflicts.push({
        type: "outside_availability",
        message: "Time slot is outside coach availability for this day",
        details: {
          dayOfWeek,
          availableSlots: rulesForDay.map((r) => ({
            startTime: r.startTime,
            endTime: r.endTime,
          })),
        },
      });
    }
  }

  // 3. Check for overlapping appointments
  for (const appointment of input.existingAppointments) {
    const apptStart = toUtcTimeStr(appointment.startAt);
    const apptEnd = toUtcTimeStr(appointment.endAt);

    if (input.startTime < apptEnd && input.endTime > apptStart) {
      conflicts.push({
        type: "appointment",
        message: `Conflicts with existing appointment from ${apptStart} to ${apptEnd}`,
        details: { appointmentId: appointment.id },
      });
    }
  }

  // 4. Check for training schedule conflicts on that day of week
  const schedulesForDay = input.trainingSchedules.filter(
    (s) => s.dayOfWeek === dayOfWeek && s.isActive,
  );

  for (const schedule of schedulesForDay) {
    if (input.startTime < schedule.endTime && input.endTime > schedule.startTime) {
      conflicts.push({
        type: "training_schedule",
        message: `Conflicts with training schedule from ${schedule.startTime} to ${schedule.endTime}`,
        details: {
          trainingScheduleId: schedule.id,
          studentId: schedule.studentId,
        },
      });
    }
  }

  return conflicts;
}
