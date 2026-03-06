import { BadRequestException, Injectable } from "@nestjs/common";

import { AvailabilityRepository } from "@shared/repositories/availability.repository";
import { IAccessToken } from "@shared/interfaces";
import { AvailabilitySlot } from "@config/database/schema/availability";

import { CreateAvailabilitySchema, CreateAvailabilityInput } from "./dtos/request.dto";

@Injectable()
export class CreateAvailabilityService {
  constructor(private readonly availabilityRepository: AvailabilityRepository) {}

  async execute(dto: CreateAvailabilityInput, currentUser: IAccessToken): Promise<AvailabilitySlot> {
    const parsed = CreateAvailabilitySchema.safeParse(dto);
    if (!parsed.success) {
      throw new BadRequestException(parsed.error.issues[0].message);
    }

    return this.availabilityRepository.create({
      personalId: currentUser.personalId as string,
      dayOfWeek: parsed.data.dayOfWeek,
      startTime: parsed.data.startTime,
      endTime: parsed.data.endTime,
    });
  }
}
