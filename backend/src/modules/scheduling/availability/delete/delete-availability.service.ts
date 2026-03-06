import { Injectable, NotFoundException } from "@nestjs/common";

import { AvailabilityRepository } from "@shared/repositories/availability.repository";
import { IAccessToken } from "@shared/interfaces";

@Injectable()
export class DeleteAvailabilityService {
  constructor(private readonly availabilityRepository: AvailabilityRepository) {}

  async execute(id: string, currentUser: IAccessToken): Promise<void> {
    const slot = await this.availabilityRepository.findOwnedById(
      id,
      currentUser.personalId as string,
    );
    if (!slot) {
      throw new NotFoundException("Slot de disponibilidade não encontrado");
    }

    await this.availabilityRepository.delete(id, currentUser.personalId as string);
  }
}
