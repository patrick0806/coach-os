import { Injectable } from "@nestjs/common";

import {
  CoachStudentRelationsRepository,
  CoachStudentRelationWithStudent,
} from "@shared/repositories/coachStudentRelations.repository";

@Injectable()
export class ListRelationsUseCase {
  constructor(
    private readonly coachStudentRelationsRepository: CoachStudentRelationsRepository,
  ) {}

  async execute(tenantId: string): Promise<CoachStudentRelationWithStudent[]> {
    return this.coachStudentRelationsRepository.findByTenantId(tenantId);
  }
}
