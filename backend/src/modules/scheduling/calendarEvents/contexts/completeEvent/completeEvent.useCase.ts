import { Injectable, NotFoundException, BadRequestException } from "@nestjs/common";

import {
  CalendarEventsRepository,
  CalendarEvent,
} from "@shared/repositories/calendarEvents.repository";

@Injectable()
export class CompleteEventUseCase {
  constructor(
    private readonly calendarEventsRepository: CalendarEventsRepository,
  ) {}

  async execute(id: string, tenantId: string): Promise<CalendarEvent> {
    const existing = await this.calendarEventsRepository.findById(id, tenantId);
    if (!existing) {
      throw new NotFoundException("Event not found");
    }

    if (existing.status !== "scheduled") {
      throw new BadRequestException("Only scheduled events can be completed");
    }

    const updated = await this.calendarEventsRepository.update(id, tenantId, {
      status: "completed",
    });

    return updated!;
  }
}
