import { Injectable } from "@nestjs/common";
import { z } from "zod";

import { WorkoutSessionsRepository, WorkoutSession } from "@shared/repositories/workoutSessions.repository";
import { validate } from "@shared/utils/validation.util";
import { Page } from "@shared/interfaces/pagenation.interface";

const listSessionsSchema = z.object({
  page: z.coerce.number().int().min(0).default(0),
  size: z.coerce.number().int().min(1).max(100).default(10),
  status: z.enum(["started", "paused", "finished", "skipped"]).optional(),
});

@Injectable()
export class ListWorkoutSessionsUseCase {
  constructor(
    private readonly workoutSessionsRepository: WorkoutSessionsRepository,
  ) {}

  async execute(
    studentId: string,
    query: unknown,
    tenantId: string,
  ): Promise<Page<WorkoutSession>> {
    const params = validate(listSessionsSchema, query);

    const { rows, total } = await this.workoutSessionsRepository.findAllByStudentId(
      studentId,
      tenantId,
      {
        page: params.page,
        size: params.size,
        status: params.status,
      },
    );

    return {
      content: rows,
      page: params.page,
      size: params.size,
      totalElements: total,
      totalPages: Math.ceil(total / params.size),
    };
  }
}
