import { Injectable } from "@nestjs/common";

import { AvailabilityRepository } from "@shared/repositories/availability.repository";
import { IAccessToken } from "@shared/interfaces";
import { AvailabilitySlot } from "@config/database/schema/availability";

@Injectable()
export class ListAvailabilityService {
  constructor(private readonly availabilityRepository: AvailabilityRepository) {}

  async execute(currentUser: IAccessToken): Promise<AvailabilitySlot[]> {
    return this.availabilityRepository.findByPersonalId(currentUser.personalId as string);
  }
}
