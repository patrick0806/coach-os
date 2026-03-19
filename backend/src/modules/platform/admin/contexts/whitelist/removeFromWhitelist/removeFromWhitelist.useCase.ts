import { Injectable, NotFoundException } from "@nestjs/common";
import { PersonalsRepository } from "@shared/repositories/personals.repository";

@Injectable()
export class RemoveFromWhitelistUseCase {
  constructor(private readonly personalsRepository: PersonalsRepository) {}

  async execute(personalId: string): Promise<void> {
    const personal = await this.personalsRepository.findById(personalId);
    if (!personal) {
      throw new NotFoundException("Personal not found");
    }
    await this.personalsRepository.setWhitelisted(personalId, false);
  }
}
