import { BadRequestException, ConflictException, Injectable } from "@nestjs/common";

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

    const personalId = currentUser.personalId as string;

    const conflict = await this.availabilityRepository.findConflicting(
      personalId,
      parsed.data.dayOfWeek,
      parsed.data.startTime,
      parsed.data.endTime,
    );
    if (conflict) {
      throw new ConflictException("Já existe um slot de disponibilidade neste horário para este dia");
    }

    return this.availabilityRepository.create({
      personalId,
      dayOfWeek: parsed.data.dayOfWeek,
      startTime: parsed.data.startTime,
      endTime: parsed.data.endTime,
    });
  }
}
