import { Injectable } from "@nestjs/common";
import { z } from "zod";
import { AppointmentsRepository } from "@shared/repositories/appointments.repository";
import { AvailabilityExceptionsRepository } from "@shared/repositories/availabilityExceptions.repository";
import { TrainingSchedulesRepository } from "@shared/repositories/trainingSchedules.repository";
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
    private readonly studentsRepository: StudentsRepository,
  ) {}

  async execute(query: unknown, tenantId: string): Promise<CalendarEntry[]> {
    const params = validate(getCalendarSchema, query);

    const startDate = new Date(`${params.startDate}T00:00:00Z`);
    const endDate = new Date(`${params.endDate}T23:59:59Z`);

    const [appointmentsResult, exceptions, trainingSchedules] =
      await Promise.all([
        this.appointmentsRepository.findAllByTenantId(tenantId, {
          page: 0,
          size: 1000,
          startDate,
          endDate,
        }),
        this.availabilityExceptionsRepository.findByDateRange(
          tenantId,
          params.startDate,
          params.endDate,
        ),
        this.trainingSchedulesRepository.findByTenantId(tenantId, true),
      ]);

    const entries: CalendarEntry[] = [];

    // Add appointments
    for (const apt of appointmentsResult.rows) {
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

    // Build a map of studentId -> studentName for schedules
    const studentIds = [...new Set(trainingSchedules.map((s) => s.studentId))];
    const studentMap = new Map<string, string>();
    for (const sid of studentIds) {
      const student = await this.studentsRepository.findById(sid, tenantId);
      if (student) {
        studentMap.set(sid, (student as any).name ?? (student as any).userName ?? sid);
      }
    }

    for (const day of days) {
      const dayOfWeek = day.getUTCDay();
      const pad = (n: number) => n.toString().padStart(2, "0");
      const dateStr = `${day.getUTCFullYear()}-${pad(day.getUTCMonth() + 1)}-${pad(day.getUTCDate())}`;

      for (const schedule of trainingSchedules) {
        if (schedule.dayOfWeek === dayOfWeek) {
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
