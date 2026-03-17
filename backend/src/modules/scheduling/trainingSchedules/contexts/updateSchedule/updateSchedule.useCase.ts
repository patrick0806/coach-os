import { Injectable, NotFoundException } from "@nestjs/common";
import { z } from "zod";

import {
  TrainingSchedulesRepository,
  TrainingSchedule,
} from "@shared/repositories/trainingSchedules.repository";
import { validate } from "@shared/utils/validation.util";

const updateScheduleSchema = z
  .object({
    dayOfWeek: z.number().int().min(0).max(6).optional(),
    startTime: z
      .string()
      .regex(/^\d{2}:\d{2}$/, "Must be HH:MM format")
      .optional(),
    endTime: z
      .string()
      .regex(/^\d{2}:\d{2}$/, "Must be HH:MM format")
      .optional(),
    location: z.string().max(300).nullable().optional(),
  })
  .refine(
    (data) => {
      if (data.startTime && data.endTime) {
        return data.startTime < data.endTime;
      }
      return true;
    },
    { message: "startTime must be before endTime", path: ["startTime"] },
  );

@Injectable()
export class UpdateTrainingScheduleUseCase {
  constructor(
    private readonly trainingSchedulesRepository: TrainingSchedulesRepository,
  ) {}

  async execute(
    id: string,
    body: unknown,
    tenantId: string,
  ): Promise<TrainingSchedule> {
    const data = validate(updateScheduleSchema, body);

    const existing = await this.trainingSchedulesRepository.findById(
      id,
      tenantId,
    );
    if (!existing) {
      throw new NotFoundException("Training schedule not found");
    }

    const updateData: Partial<{
      dayOfWeek: number;
      startTime: string;
      endTime: string;
      location: string | null;
    }> = {};

    if (data.dayOfWeek !== undefined) updateData.dayOfWeek = data.dayOfWeek;
    if (data.startTime !== undefined) updateData.startTime = data.startTime;
    if (data.endTime !== undefined) updateData.endTime = data.endTime;
    if (data.location !== undefined) updateData.location = data.location;

    const updated = await this.trainingSchedulesRepository.update(
      id,
      tenantId,
      updateData,
    );

    return updated!;
  }
}
