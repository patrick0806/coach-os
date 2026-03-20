import { Injectable } from "@nestjs/common";

import { PersonalsRepository } from "@shared/repositories/personals.repository";

@Injectable()
export class GetTourProgressUseCase {
  constructor(private readonly personalsRepository: PersonalsRepository) {}

  async execute(tenantId: string): Promise<string[]> {
    return this.personalsRepository.getTourProgress(tenantId);
  }
}
