import { Injectable } from "@nestjs/common";

import { PersonalsRepository } from "@shared/repositories/personals.repository";
import { StudentsRepository } from "@shared/repositories/students.repository";

import { GetDashboardStatsResponseDTO } from "./dtos/response.dto";

@Injectable()
export class GetDashboardStatsUseCase {
  constructor(
    private readonly personalsRepository: PersonalsRepository,
    private readonly studentsRepository: StudentsRepository,
  ) {}

  async execute(): Promise<GetDashboardStatsResponseDTO> {
    const [totalCoaches, payingCoaches, newThisMonth, totalStudents, whitelistedCoaches] =
      await Promise.all([
        this.personalsRepository.countAll(),
        this.personalsRepository.countByAccessStatus("active"),
        this.personalsRepository.countCreatedThisMonth(),
        this.studentsRepository.countAll(),
        this.personalsRepository.countWhitelisted(),
      ]);

    return { totalCoaches, payingCoaches, newThisMonth, totalStudents, whitelistedCoaches };
  }
}
