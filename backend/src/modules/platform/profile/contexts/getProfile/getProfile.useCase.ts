import { Injectable, NotFoundException } from "@nestjs/common";

import { PersonalsRepository } from "@shared/repositories/personals.repository";
import { Personal } from "@config/database/schema/personals";

@Injectable()
export class GetProfileUseCase {
  constructor(private readonly personalsRepository: PersonalsRepository) {}

  async execute(tenantId: string): Promise<Personal> {
    const profile = await this.personalsRepository.findById(tenantId);

    if (!profile) {
      throw new NotFoundException("Profile not found");
    }

    return profile;
  }
}
