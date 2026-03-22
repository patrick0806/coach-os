import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from "@nestjs/common";
import { z } from "zod";
import { startOfWeek, endOfWeek, parseISO } from "date-fns";

import { TrainingSchedulesRepository } from "@shared/repositories/trainingSchedules.repository";
import {
  TrainingScheduleExceptionsRepository,
  TrainingScheduleException,
} from "@shared/repositories/trainingScheduleExceptions.repository";
import { AvailabilityRulesRepository } from "@shared/repositories/availabilityRules.repository";
import { AvailabilityExceptionsRepository } from "@shared/repositories/availabilityExceptions.repository";
import { AppointmentsRepository } from "@shared/repositories/appointments.repository";
import { validate } from "@shared/utils/validation.util";
import { detectConflicts } from "../../../../scheduling/shared/conflictDetection.util";

const rescheduleOccurrenceSchema = z.object({
  originalDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Must be YYYY-MM-DD"),
  newDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Must be YYYY-MM-DD"),
  newStartTime: z.string().regex(/^\d{2}:\d{2}$/, "Must be HH:MM"),
  newEndTime: z.string().regex(/^\d{2}:\d{2}$/, "Must be HH:MM"),
  newLocation: z.string().max(300).optional(),
  reason: z.string().optional(),
  forceCreate: z.boolean().default(false),
});

@Injectable()
export class RescheduleOccurrenceUseCase {
  constructor(
    private readonly trainingSchedulesRepository: TrainingSchedulesRepository,
    private readonly exceptionsRepository: TrainingScheduleExceptionsRepository,
    private readonly availabilityRulesRepository: AvailabilityRulesRepository,
    private readonly availabilityExceptionsRepository: AvailabilityExceptionsRepository,
    private readonly appointmentsRepository: AppointmentsRepository,
  ) {}

  async execute(
    scheduleId: string,
    body: unknown,
    tenantId: string,
  ): Promise<TrainingScheduleException> {
    const data = validate(rescheduleOccurrenceSchema, body);

    // 1. Find the training schedule
    const schedule = await this.trainingSchedulesRepository.findById(scheduleId, tenantId);
    if (!schedule) {
      throw new NotFoundException("Training schedule not found");
    }

    // 2. Validate originalDate falls on the correct dayOfWeek
    const originalDateObj = parseISO(data.originalDate);
    if (originalDateObj.getUTCDay() !== schedule.dayOfWeek) {
      throw new BadRequestException(
        "originalDate does not match the training schedule day of week",
      );
    }

    // 3. Validate newDate is in the same week as originalDate (Monday–Sunday)
    const weekStart = startOfWeek(originalDateObj, { weekStartsOn: 1 });
    const weekEnd = endOfWeek(originalDateObj, { weekStartsOn: 1 });
    const newDateObj = parseISO(data.newDate);
    if (newDateObj < weekStart || newDateObj > weekEnd) {
      throw new BadRequestException(
        "newDate must be within the same week as originalDate",
      );
    }

    // 4. Validate newStartTime < newEndTime
    if (data.newStartTime >= data.newEndTime) {
      throw new BadRequestException("newStartTime must be before newEndTime");
    }

    // 5. Check for existing exception on same date
    const existing = await this.exceptionsRepository.findByScheduleAndOriginalDate(
      scheduleId,
      data.originalDate,
      tenantId,
    );
    if (existing) {
      throw new ConflictException("An exception already exists for this training on this date");
    }

    // 6. Conflict detection for the new time slot
    const newDateForConflict = new Date(`${data.newDate}T${data.newStartTime}:00Z`);
    const newEndDateForConflict = new Date(`${data.newDate}T${data.newEndTime}:00Z`);

    const [availabilityRules, availabilityExceptions, existingAppointments, trainingSchedules] =
      await Promise.all([
        this.availabilityRulesRepository.findByTenantId(tenantId),
        this.availabilityExceptionsRepository.findByDateRange(tenantId, data.newDate, data.newDate),
        this.appointmentsRepository.findOverlapping(tenantId, newDateForConflict, newEndDateForConflict),
        this.trainingSchedulesRepository.findByTenantId(tenantId),
      ]);

    // Exclude the schedule being rescheduled from conflict check
    const filteredSchedules = trainingSchedules.filter((s) => s.id !== scheduleId);

    const scheduleIds = filteredSchedules.map((s) => s.id);
    const trainingScheduleExceptions = scheduleIds.length > 0
      ? await this.exceptionsRepository.findByScheduleIdsAndDateRange(scheduleIds, data.newDate, data.newDate, tenantId)
      : [];

    const conflicts = detectConflicts({
      date: newDateForConflict,
      startTime: data.newStartTime,
      endTime: data.newEndTime,
      availabilityRules,
      availabilityExceptions,
      existingAppointments,
      trainingSchedules: filteredSchedules,
      trainingScheduleExceptions,
    });

    if (conflicts.length > 0 && !data.forceCreate) {
      throw new ConflictException({
        message: "Training reschedule has conflicts",
        conflicts,
      });
    }

    // 7. Create the exception
    return this.exceptionsRepository.create({
      tenantId,
      trainingScheduleId: scheduleId,
      originalDate: data.originalDate,
      action: "reschedule",
      newDate: data.newDate,
      newStartTime: data.newStartTime,
      newEndTime: data.newEndTime,
      newLocation: data.newLocation,
      reason: data.reason,
    });
  }
}
