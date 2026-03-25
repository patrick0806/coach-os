import {
  Injectable,
  NotFoundException,
  BadRequestException,
  HttpException,
  HttpStatus,
} from "@nestjs/common";
import { z } from "zod";

import {
  CalendarEventsRepository,
  CalendarEvent,
} from "@shared/repositories/calendarEvents.repository";
import { RecurringSlotsRepository } from "@shared/repositories/recurringSlots.repository";
import { WorkingHoursRepository } from "@shared/repositories/workingHours.repository";
import { validate } from "@shared/utils/validation.util";
import { detectConflictsV2 } from "../../../shared/conflictDetectionV2.util";
import { buildCalendar } from "../../../shared/calendarPipeline.util";

const updateEventSchema = z.object({
  startAt: z.coerce.date().optional(),
  endAt: z.coerce.date().optional(),
  appointmentType: z.enum(["online", "presential"]).optional(),
  meetingUrl: z.string().max(500).nullable().optional(),
  location: z.string().max(300).nullable().optional(),
  notes: z.string().nullable().optional(),
  forceCreate: z.boolean().default(false),
});

@Injectable()
export class UpdateEventUseCase {
  constructor(
    private readonly calendarEventsRepository: CalendarEventsRepository,
    private readonly recurringSlotsRepository: RecurringSlotsRepository,
    private readonly workingHoursRepository: WorkingHoursRepository,
  ) {}

  async execute(
    id: string,
    body: unknown,
    tenantId: string,
  ): Promise<CalendarEvent> {
    const data = validate(updateEventSchema, body);

    const existing = await this.calendarEventsRepository.findById(id, tenantId);
    if (!existing) {
      throw new NotFoundException("Event not found");
    }

    const newStartAt = data.startAt ?? existing.startAt;
    const newEndAt = data.endAt ?? existing.endAt;

    if (newStartAt >= newEndAt) {
      throw new BadRequestException("startAt must be before endAt");
    }

    // Run conflict detection if dates changed
    const datesChanged =
      (data.startAt && data.startAt.getTime() !== existing.startAt.getTime()) ||
      (data.endAt && data.endAt.getTime() !== existing.endAt.getTime());

    if (datesChanged) {
      const pad = (n: number) => n.toString().padStart(2, "0");
      const dateStr = `${newStartAt.getUTCFullYear()}-${pad(newStartAt.getUTCMonth() + 1)}-${pad(newStartAt.getUTCDate())}`;

      const dayStart = new Date(`${dateStr}T00:00:00Z`);
      const dayEnd = new Date(`${dateStr}T23:59:59Z`);

      const [workingHoursList, recurringSlots, existingEvents] = await Promise.all([
        this.workingHoursRepository.findActiveInDateRange(tenantId, dateStr, dateStr),
        this.recurringSlotsRepository.findActiveInDateRange(tenantId, dateStr, dateStr),
        this.calendarEventsRepository.findByDateRange(tenantId, dayStart, dayEnd),
      ]);

      const calendarEntries = buildCalendar({
        recurringSlots,
        calendarEvents: existingEvents,
        startDate: dayStart,
        endDate: dayEnd,
      });

      const conflicts = detectConflictsV2({
        proposedStartAt: newStartAt,
        proposedEndAt: newEndAt,
        workingHours: workingHoursList,
        calendarEntries,
        excludeEventId: id,
      });

      if (conflicts.length > 0 && !data.forceCreate) {
        throw new HttpException({ conflicts }, HttpStatus.CONFLICT);
      }
    }

    const updateData: Record<string, unknown> = {};
    if (data.startAt !== undefined) updateData.startAt = data.startAt;
    if (data.endAt !== undefined) updateData.endAt = data.endAt;
    if (data.appointmentType !== undefined) updateData.appointmentType = data.appointmentType;
    if (data.meetingUrl !== undefined) updateData.meetingUrl = data.meetingUrl;
    if (data.location !== undefined) updateData.location = data.location;
    if (data.notes !== undefined) updateData.notes = data.notes;

    const updated = await this.calendarEventsRepository.update(id, tenantId, updateData as any);

    return updated!;
  }
}
