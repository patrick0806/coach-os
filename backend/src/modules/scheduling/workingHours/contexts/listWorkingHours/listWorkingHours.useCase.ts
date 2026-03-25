import { Injectable } from "@nestjs/common";

import {
  WorkingHoursRepository,
  WorkingHours,
} from "@shared/repositories/workingHours.repository";

@Injectable()
export class ListWorkingHoursUseCase {
  constructor(
    private readonly workingHoursRepository: WorkingHoursRepository,
  ) {}

  async execute(tenantId: string): Promise<WorkingHours[]> {
    return this.workingHoursRepository.findActiveByTenant(tenantId);
  }
}
