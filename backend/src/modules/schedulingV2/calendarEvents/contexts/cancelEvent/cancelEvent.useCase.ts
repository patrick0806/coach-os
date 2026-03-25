import { Injectable, NotFoundException, BadRequestException } from "@nestjs/common";
import { z } from "zod";

import {
  CalendarEventsRepository,
  CalendarEvent,
} from "@shared/repositories/calendarEvents.repository";
import { validate } from "@shared/utils/validation.util";

const cancelEventSchema = z.object({
  cancellationReason: z.string().max(500).optional(),
});

@Injectable()
export class CancelEventUseCase {
  constructor(
    private readonly calendarEventsRepository: CalendarEventsRepository,
  ) {}

  async execute(
    id: string,
    body: unknown,
    tenantId: string,
  ): Promise<CalendarEvent> {
    const data = validate(cancelEventSchema, body);

    const existing = await this.calendarEventsRepository.findById(id, tenantId);
    if (!existing) {
      throw new NotFoundException("Event not found");
    }

    if (existing.status !== "scheduled") {
      throw new BadRequestException("Only scheduled events can be cancelled");
    }

    const updated = await this.calendarEventsRepository.update(id, tenantId, {
      status: "cancelled",
      cancelledAt: new Date(),
      cancellationReason: data.cancellationReason,
    });

    return updated!;
  }
}
