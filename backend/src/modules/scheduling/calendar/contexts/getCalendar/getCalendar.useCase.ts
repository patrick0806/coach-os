import { Injectable } from "@nestjs/common";
import { z } from "zod";
import { AppointmentsRepository } from "@shared/repositories/appointments.repository";
import { AvailabilityExceptionsRepository } from "@shared/repositories/availabilityExceptions.repository";
import { TrainingSchedulesRepository } from "@shared/repositories/trainingSchedules.repository";
import { TrainingScheduleExceptionsRepository } from "@shared/repositories/trainingScheduleExceptions.repository";
import { StudentsRepository } from "@shared/repositories/students.repository";
import { validate } from "@shared/utils/validation.util";

export interface CalendarEntry {
  type: "appointment" | "training_schedule" | "exception";
  date: string;
  startTime?: string;
  endTime?: string;
  studentId?: string;
  studentName?: string;
  appointmentType?: string;
  status?: string;
  location?: string;
  meetingUrl?: string;
  reason?: string;
  sourceId: string;
  isRescheduled?: boolean;
  exceptionId?: string;
}

const getCalendarSchema = z.object({
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Must be YYYY-MM-DD format"),
  endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Must be YYYY-MM-DD format"),
});

@Injectable()
export class GetCalendarUseCase {
  constructor(
    private readonly appointmentsRepository: AppointmentsRepository,
    private readonly availabilityExceptionsRepository: AvailabilityExceptionsRepository,
    private readonly trainingSchedulesRepository: TrainingSchedulesRepository,
    private readonly trainingScheduleExceptionsRepository: TrainingScheduleExceptionsRepository,
    private readonly studentsRepository: StudentsRepository,
  ) {}

  async execute(query: unknown, tenantId: string): Promise<CalendarEntry[]> {
    const params = validate(getCalendarSchema, query);

    const startDate = new Date(`${params.startDate}T00:00:00Z`);
    const endDate = new Date(`${params.endDate}T23:59:59Z`);

    const [appointmentsList, exceptions, trainingSchedules] =
      await Promise.all([
        this.appointmentsRepository.findAllInDateRange(tenantId, startDate, endDate),
        this.availabilityExceptionsRepository.findByDateRange(
          tenantId,
          params.startDate,
          params.endDate,
        ),
        this.trainingSchedulesRepository.findByTenantId(tenantId, true),
      ]);

    const entries: CalendarEntry[] = [];

    // Add appointments
    for (const apt of appointmentsList) {
      const pad = (n: number) => n.toString().padStart(2, "0");
      entries.push({
        type: "appointment",
        date: `${apt.startAt.getUTCFullYear()}-${pad(apt.startAt.getUTCMonth() + 1)}-${pad(apt.startAt.getUTCDate())}`,
        startTime: `${pad(apt.startAt.getUTCHours())}:${pad(apt.startAt.getUTCMinutes())}`,
        endTime: `${pad(apt.endAt.getUTCHours())}:${pad(apt.endAt.getUTCMinutes())}`,
        studentId: apt.studentId,
        studentName: apt.studentName ?? undefined,
        appointmentType: apt.appointmentType,
        status: apt.status,
        location: apt.location ?? undefined,
        meetingUrl: apt.meetingUrl ?? undefined,
        sourceId: apt.id,
      });
    }

    // Expand training schedules for each day in range (UTC-based iteration)
    const days: Date[] = [];
    const rangeEnd = new Date(`${params.endDate}T00:00:00Z`);
    for (let d = new Date(startDate); d <= rangeEnd; d = new Date(d.getTime() + 86400000)) {
      days.push(new Date(d));
    }

    // Build a map of studentId -> studentName for schedules (single batch query)
    const studentIds = [...new Set(trainingSchedules.map((s) => s.studentId))];
    const studentMap = new Map<string, string>();
    if (studentIds.length > 0) {
      const studentsList = await this.studentsRepository.findByIds(studentIds, tenantId);
      for (const student of studentsList) {
        studentMap.set(student.id, student.name ?? student.id);
      }
    }

    // Fetch training schedule exceptions for the date range
    const scheduleIds = trainingSchedules.map((s) => s.id);
    const trainingExceptions = scheduleIds.length > 0
      ? await this.trainingScheduleExceptionsRepository.findByScheduleIdsAndDateRange(
          scheduleIds,
          params.startDate,
          params.endDate,
          tenantId,
        )
      : [];

    // Build a lookup: scheduleId+date -> exception
    const exceptionMap = new Map<string, typeof trainingExceptions[0]>();
    for (const exc of trainingExceptions) {
      exceptionMap.set(`${exc.trainingScheduleId}:${exc.originalDate}`, exc);
    }

    // Also collect rescheduled entries to add at their new dates
    const rescheduledEntries: CalendarEntry[] = [];

    for (const day of days) {
      const dayOfWeek = day.getUTCDay();
      const pad = (n: number) => n.toString().padStart(2, "0");
      const dateStr = `${day.getUTCFullYear()}-${pad(day.getUTCMonth() + 1)}-${pad(day.getUTCDate())}`;

      for (const schedule of trainingSchedules) {
        if (schedule.dayOfWeek === dayOfWeek) {
          const exception = exceptionMap.get(`${schedule.id}:${dateStr}`);

          if (exception?.action === "skip") {
            // Skipped — do not add entry for this date
            continue;
          }

          if (exception?.action === "reschedule") {
            // Add rescheduled entry at the new date instead
            rescheduledEntries.push({
              type: "training_schedule",
              date: exception.newDate!,
              startTime: exception.newStartTime ?? schedule.startTime,
              endTime: exception.newEndTime ?? schedule.endTime,
              studentId: schedule.studentId,
              studentName: studentMap.get(schedule.studentId),
              location: exception.newLocation ?? schedule.location ?? undefined,
              sourceId: schedule.id,
              isRescheduled: true,
              exceptionId: exception.id,
            });
            continue;
          }

          // Normal entry — no exception
          entries.push({
            type: "training_schedule",
            date: dateStr,
            startTime: schedule.startTime,
            endTime: schedule.endTime,
            studentId: schedule.studentId,
            studentName: studentMap.get(schedule.studentId),
            location: schedule.location ?? undefined,
            sourceId: schedule.id,
          });
        }
      }
    }

    // Add rescheduled entries (only those whose newDate falls within the range)
    for (const entry of rescheduledEntries) {
      if (entry.date >= params.startDate && entry.date <= params.endDate) {
        entries.push(entry);
      }
    }

    // Add exceptions
    for (const exc of exceptions) {
      entries.push({
        type: "exception",
        date: exc.exceptionDate,
        reason: exc.reason ?? undefined,
        sourceId: exc.id,
      });
    }

    // Sort by date and startTime
    entries.sort((a, b) => {
      const dateCmp = a.date.localeCompare(b.date);
      if (dateCmp !== 0) return dateCmp;
      return (a.startTime ?? "").localeCompare(b.startTime ?? "");
    });

    return entries;
  }
}
