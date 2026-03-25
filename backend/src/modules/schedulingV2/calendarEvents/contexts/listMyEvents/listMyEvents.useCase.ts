import { Injectable, BadRequestException } from "@nestjs/common";
import { z } from "zod";

import {
  CalendarEventsRepository,
  CalendarEventWithStudent,
} from "@shared/repositories/calendarEvents.repository";
import { validate } from "@shared/utils/validation.util";

const listMyEventsSchema = z.object({
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  status: z.string().optional(),
});

@Injectable()
export class ListMyEventsUseCase {
  constructor(
    private readonly calendarEventsRepository: CalendarEventsRepository,
  ) {}

  async execute(
    studentId: string,
    tenantId: string,
    query: unknown,
  ): Promise<CalendarEventWithStudent[]> {
    const params = validate(listMyEventsSchema, query);

    const startDate = new Date(`${params.startDate}T00:00:00Z`);
    const endDate = new Date(`${params.endDate}T23:59:59Z`);

    if (startDate > endDate) {
      throw new BadRequestException("startDate must be before endDate");
    }

    return this.calendarEventsRepository.findByStudentAndDateRange(
      studentId,
      tenantId,
      startDate,
      endDate,
    );
  }
}
