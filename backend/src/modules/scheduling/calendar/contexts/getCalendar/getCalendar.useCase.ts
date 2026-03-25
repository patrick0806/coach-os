import { Injectable } from "@nestjs/common";
import { z } from "zod";

import { RecurringSlotsRepository } from "@shared/repositories/recurringSlots.repository";
import { CalendarEventsRepository } from "@shared/repositories/calendarEvents.repository";
import { StudentsRepository } from "@shared/repositories/students.repository";
import { validate } from "@shared/utils/validation.util";
import {
  buildCalendar,
  UnifiedCalendarEntry,
} from "../../../shared/calendarPipeline.util";

const getCalendarSchema = z.object({
  start: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Must be YYYY-MM-DD format"),
  end: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Must be YYYY-MM-DD format"),
});

@Injectable()
export class GetCalendarUseCase {
  constructor(
    private readonly recurringSlotsRepository: RecurringSlotsRepository,
    private readonly calendarEventsRepository: CalendarEventsRepository,
    private readonly studentsRepository: StudentsRepository,
  ) {}

  async execute(
    query: unknown,
    tenantId: string,
  ): Promise<UnifiedCalendarEntry[]> {
    const params = validate(getCalendarSchema, query);

    const startDate = new Date(`${params.start}T00:00:00Z`);
    const endDate = new Date(`${params.end}T23:59:59Z`);

    const [slots, events] = await Promise.all([
      this.recurringSlotsRepository.findActiveInDateRange(
        tenantId,
        params.start,
        params.end,
      ),
      this.calendarEventsRepository.findByDateRange(tenantId, startDate, endDate),
    ]);

    // Build student name map
    const studentIds = new Set<string>();
    for (const slot of slots) {
      if (slot.studentId) studentIds.add(slot.studentId);
    }
    for (const event of events) {
      if (event.studentId) studentIds.add(event.studentId);
    }

    const studentNames = new Map<string, string>();
    if (studentIds.size > 0) {
      const studentsList = await this.studentsRepository.findByIds(
        [...studentIds],
        tenantId,
      );
      for (const student of studentsList) {
        studentNames.set(student.id, student.name ?? student.id);
      }
    }

    return buildCalendar({
      recurringSlots: slots,
      calendarEvents: events,
      startDate,
      endDate,
      studentNames,
    });
  }
}
