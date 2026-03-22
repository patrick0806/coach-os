import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from "@nestjs/common";
import { z } from "zod";
import { parseISO } from "date-fns";

import { TrainingSchedulesRepository } from "@shared/repositories/trainingSchedules.repository";
import {
  TrainingScheduleExceptionsRepository,
  TrainingScheduleException,
} from "@shared/repositories/trainingScheduleExceptions.repository";
import { validate } from "@shared/utils/validation.util";

const skipOccurrenceSchema = z.object({
  originalDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Must be YYYY-MM-DD"),
  reason: z.string().optional(),
});

@Injectable()
export class SkipOccurrenceUseCase {
  constructor(
    private readonly trainingSchedulesRepository: TrainingSchedulesRepository,
    private readonly exceptionsRepository: TrainingScheduleExceptionsRepository,
  ) {}

  async execute(
    scheduleId: string,
    body: unknown,
    tenantId: string,
  ): Promise<TrainingScheduleException> {
    const data = validate(skipOccurrenceSchema, body);

    const schedule = await this.trainingSchedulesRepository.findById(scheduleId, tenantId);
    if (!schedule) {
      throw new NotFoundException("Training schedule not found");
    }

    const originalDateObj = parseISO(data.originalDate);
    if (originalDateObj.getUTCDay() !== schedule.dayOfWeek) {
      throw new BadRequestException(
        "originalDate does not match the training schedule day of week",
      );
    }

    const existing = await this.exceptionsRepository.findByScheduleAndOriginalDate(
      scheduleId,
      data.originalDate,
      tenantId,
    );
    if (existing) {
      throw new ConflictException("An exception already exists for this training on this date");
    }

    return this.exceptionsRepository.create({
      tenantId,
      trainingScheduleId: scheduleId,
      originalDate: data.originalDate,
      action: "skip",
      reason: data.reason,
    });
  }
}
