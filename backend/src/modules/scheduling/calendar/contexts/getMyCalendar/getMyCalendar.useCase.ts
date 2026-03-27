import { Injectable } from "@nestjs/common";
import { z } from "zod";

import { RecurringSlotsRepository } from "@shared/repositories/recurringSlots.repository";
import { CalendarEventsRepository } from "@shared/repositories/calendarEvents.repository";
import { validate } from "@shared/utils/validation.util";
import {
  buildCalendar,
  UnifiedCalendarEntry,
} from "../../../shared/calendarPipeline.util";

const getMyCalendarSchema = z.object({
  start: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Must be YYYY-MM-DD format"),
  end: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Must be YYYY-MM-DD format"),
});

@Injectable()
export class GetMyCalendarUseCase {
  constructor(
    private readonly recurringSlotsRepository: RecurringSlotsRepository,
    private readonly calendarEventsRepository: CalendarEventsRepository,
  ) {}

  async execute(
    query: unknown,
    studentId: string,
    tenantId: string,
  ): Promise<UnifiedCalendarEntry[]> {
    const params = validate(getMyCalendarSchema, query);

    const startDate = new Date(`${params.start}T00:00:00Z`);
    const endDate = new Date(`${params.end}T23:59:59Z`);

    const [slots, events] = await Promise.all([
      this.recurringSlotsRepository.findByStudentId(studentId, tenantId, true),
      this.calendarEventsRepository.findByStudentAndDateRange(
        studentId,
        tenantId,
        startDate,
        endDate,
      ),
    ]);

    return buildCalendar({
      recurringSlots: slots,
      calendarEvents: events,
      startDate,
      endDate,
    });
  }
}
