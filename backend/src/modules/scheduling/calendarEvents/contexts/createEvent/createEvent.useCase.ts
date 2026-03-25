import {
  Injectable,
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

const createEventSchema = z
  .object({
    type: z.enum(["one_off", "override", "block"]),
    startAt: z.coerce.date(),
    endAt: z.coerce.date(),
    status: z.enum(["scheduled", "cancelled", "completed", "no_show"]).default("scheduled"),
    studentId: z.string().min(1).optional(),
    recurringSlotId: z.string().min(1).optional(),
    originalStartAt: z.coerce.date().optional(),
    appointmentType: z.enum(["online", "presential"]).optional(),
    meetingUrl: z.string().max(500).optional(),
    location: z.string().max(300).optional(),
    notes: z.string().optional(),
    forceCreate: z.boolean().default(false),
  })
  .refine(
    (data) => {
      if ((data.type === "one_off" || data.type === "override") && !data.studentId) {
        return false;
      }
      return true;
    },
    { message: "studentId is required for one_off and override events", path: ["studentId"] },
  )
  .refine(
    (data) => {
      if (data.type === "override" && !data.recurringSlotId) {
        return false;
      }
      return true;
    },
    { message: "recurringSlotId is required for override events", path: ["recurringSlotId"] },
  )
  .refine(
    (data) => {
      if (data.type === "override" && !data.originalStartAt) {
        return false;
      }
      return true;
    },
    { message: "originalStartAt is required for override events", path: ["originalStartAt"] },
  )
  .refine(
    (data) => {
      if (data.type === "one_off" && !data.appointmentType) {
        return false;
      }
      return true;
    },
    { message: "appointmentType is required for one_off events", path: ["appointmentType"] },
  )
  .refine(
    (data) => {
      if (data.appointmentType === "online" && !data.meetingUrl) {
        return false;
      }
      return true;
    },
    { message: "meetingUrl is required for online appointments", path: ["meetingUrl"] },
  );

@Injectable()
export class CreateEventUseCase {
  constructor(
    private readonly calendarEventsRepository: CalendarEventsRepository,
    private readonly recurringSlotsRepository: RecurringSlotsRepository,
    private readonly workingHoursRepository: WorkingHoursRepository,
  ) {}

  async execute(body: unknown, tenantId: string): Promise<CalendarEvent> {
    const data = validate(createEventSchema, body);

    if (data.startAt >= data.endAt) {
      throw new BadRequestException("startAt must be before endAt");
    }

    // Build calendar for the day to detect conflicts
    const pad = (n: number) => n.toString().padStart(2, "0");
    const dateStr = `${data.startAt.getUTCFullYear()}-${pad(data.startAt.getUTCMonth() + 1)}-${pad(data.startAt.getUTCDate())}`;

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
      proposedStartAt: data.startAt,
      proposedEndAt: data.endAt,
      workingHours: workingHoursList,
      calendarEntries,
    });

    if (conflicts.length > 0 && !data.forceCreate) {
      throw new HttpException({ conflicts }, HttpStatus.CONFLICT);
    }

    const event = await this.calendarEventsRepository.create({
      tenantId,
      type: data.type,
      startAt: data.startAt,
      endAt: data.endAt,
      status: data.status,
      studentId: data.studentId,
      recurringSlotId: data.recurringSlotId,
      originalStartAt: data.originalStartAt,
      appointmentType: data.appointmentType,
      meetingUrl: data.meetingUrl,
      location: data.location,
      notes: data.notes,
    });

    return event;
  }
}
