import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";

import { AvailabilityRepository } from "@shared/repositories/availability.repository";
import { IAccessToken } from "@shared/interfaces";
import { AvailabilitySlot } from "@config/database/schema/availability";

import { UpdateAvailabilitySchema, UpdateAvailabilityInput } from "./dtos/request.dto";

@Injectable()
export class UpdateAvailabilityService {
  constructor(private readonly availabilityRepository: AvailabilityRepository) {}

  async execute(
    id: string,
    dto: UpdateAvailabilityInput,
    currentUser: IAccessToken,
  ): Promise<AvailabilitySlot> {
    const parsed = UpdateAvailabilitySchema.safeParse(dto);
    if (!parsed.success) {
      throw new BadRequestException(parsed.error.issues[0].message);
    }

    const slot = await this.availabilityRepository.findOwnedById(
      id,
      currentUser.personalId as string,
    );
    if (!slot) {
      throw new NotFoundException("Slot de disponibilidade não encontrado");
    }

    // Merge incoming times with existing ones for validation
    const effectiveStart = parsed.data.startTime ?? slot.startTime;
    const effectiveEnd = parsed.data.endTime ?? slot.endTime;

    if (
      (parsed.data.startTime !== undefined || parsed.data.endTime !== undefined) &&
      effectiveStart >= effectiveEnd
    ) {
      throw new BadRequestException("startTime deve ser anterior a endTime");
    }

    const updated = await this.availabilityRepository.update(
      id,
      currentUser.personalId as string,
      parsed.data,
    );

    return updated as AvailabilitySlot;
  }
}
