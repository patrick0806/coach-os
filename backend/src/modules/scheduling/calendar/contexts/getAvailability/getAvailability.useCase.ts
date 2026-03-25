import { Injectable } from "@nestjs/common";
import { z } from "zod";

import { WorkingHoursRepository } from "@shared/repositories/workingHours.repository";
import { RecurringSlotsRepository } from "@shared/repositories/recurringSlots.repository";
import { CalendarEventsRepository } from "@shared/repositories/calendarEvents.repository";
import { validate } from "@shared/utils/validation.util";
import { buildCalendar } from "../../../shared/calendarPipeline.util";
import {
  computeAvailability,
  AvailabilitySlot,
} from "../../../shared/availabilityComputation.util";

const getAvailabilitySchema = z.object({
  start: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Must be YYYY-MM-DD format"),
  end: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Must be YYYY-MM-DD format"),
});

@Injectable()
export class GetAvailabilityUseCase {
  constructor(
    private readonly workingHoursRepository: WorkingHoursRepository,
    private readonly recurringSlotsRepository: RecurringSlotsRepository,
    private readonly calendarEventsRepository: CalendarEventsRepository,
  ) {}

  async execute(
    query: unknown,
    tenantId: string,
  ): Promise<AvailabilitySlot[]> {
    const params = validate(getAvailabilitySchema, query);

    const startDate = new Date(`${params.start}T00:00:00Z`);
    const endDate = new Date(`${params.end}T23:59:59Z`);

    const [workingHours, slots, events] = await Promise.all([
      this.workingHoursRepository.findActiveInDateRange(
        tenantId,
        params.start,
        params.end,
      ),
      this.recurringSlotsRepository.findActiveInDateRange(
        tenantId,
        params.start,
        params.end,
      ),
      this.calendarEventsRepository.findByDateRange(tenantId, startDate, endDate),
    ]);

    // Build calendar to get all occupied entries
    const calendarEntries = buildCalendar({
      recurringSlots: slots,
      calendarEvents: events,
      startDate,
      endDate,
    });

    return computeAvailability({
      workingHours,
      calendarEntries,
      startDate,
      endDate,
    });
  }
}
