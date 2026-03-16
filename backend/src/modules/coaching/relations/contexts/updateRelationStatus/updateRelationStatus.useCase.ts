import { Injectable, NotFoundException } from "@nestjs/common";
import { z } from "zod";

import {
  CoachStudentRelation,
  CoachStudentRelationsRepository,
} from "@shared/repositories/coachStudentRelations.repository";
import { validate } from "@shared/utils/validation.util";

const updateRelationStatusSchema = z.object({
  status: z.enum(["active", "paused", "archived"]),
});

@Injectable()
export class UpdateRelationStatusUseCase {
  constructor(
    private readonly coachStudentRelationsRepository: CoachStudentRelationsRepository,
  ) {}

  async execute(id: string, body: unknown, tenantId: string): Promise<CoachStudentRelation> {
    const data = validate(updateRelationStatusSchema, body);

    const relation = await this.coachStudentRelationsRepository.findById(id, tenantId);
    if (!relation) {
      throw new NotFoundException("Coach-student relation not found");
    }

    const endDate = data.status === "archived" ? new Date() : null;

    const updated = await this.coachStudentRelationsRepository.updateStatus(
      id,
      tenantId,
      data.status,
      endDate,
    );

    return updated!;
  }
}
