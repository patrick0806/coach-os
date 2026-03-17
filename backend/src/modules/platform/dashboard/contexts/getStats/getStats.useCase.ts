import { Injectable } from "@nestjs/common";

import { DashboardRepository } from "../../../../../shared/repositories/dashboard.repository";
import { GetStatsResponseDTO } from "./dtos/response.dto";

@Injectable()
export class GetStatsUseCase {
  constructor(private readonly dashboardRepository: DashboardRepository) { }

  async execute(tenantId: string): Promise<GetStatsResponseDTO> {
    const counts = await this.dashboardRepository.getCounts(tenantId);

    return {
      activeStudents: counts.activeStudents,
      totalStudents: counts.totalStudents,
      programTemplates: counts.programTemplates,
      activeStudentPrograms: counts.activeStudentPrograms,
    };
  }
}
