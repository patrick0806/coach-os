import { Injectable, NotFoundException } from "@nestjs/common";

import { StudentStatsRepository, StudentStats } from "@shared/repositories/student-stats.repository";
import { IAccessToken } from "@shared/interfaces";

@Injectable()
export class MyStatsService {
  constructor(private readonly studentStatsRepository: StudentStatsRepository) {}

  async execute(currentUser: IAccessToken): Promise<StudentStats> {
    const stats = await this.studentStatsRepository.findById(currentUser.profileId);
    if (!stats) {
      throw new NotFoundException("Estatísticas não encontradas");
    }
    return stats;
  }
}
