import { BadRequestException, Injectable } from "@nestjs/common";

import { AvailabilityRepository } from "@shared/repositories/availability.repository";
import { DrizzleProvider } from "@shared/providers/drizzle.service";
import { IAccessToken } from "@shared/interfaces";

import { BulkAvailabilityInput, BulkAvailabilitySchema } from "./dtos/request.dto";
import { BulkAvailabilityResponseDTO } from "./dtos/response.dto";
import { generateAvailabilitySlots } from "../shared/availability.utils";

@Injectable()
export class BulkAvailabilityService {
  constructor(
    private readonly availabilityRepository: AvailabilityRepository,
    private readonly drizzle: DrizzleProvider,
  ) {}

  async execute(
    dto: BulkAvailabilityInput,
    currentUser: IAccessToken,
  ): Promise<BulkAvailabilityResponseDTO> {
    const parsed = BulkAvailabilitySchema.safeParse(dto);
    if (!parsed.success) {
      throw new BadRequestException(parsed.error.issues[0].message);
    }

    const slotsToCreate = generateAvailabilitySlots(
      parsed.data.startTime,
      parsed.data.endTime,
      parsed.data.slotDurationMinutes,
      parsed.data.breakStart,
      parsed.data.breakEnd,
    );

    if (slotsToCreate.length === 0) {
      throw new BadRequestException(
        "Nenhum slot pode ser gerado com os parametros informados",
      );
    }

    const personalId = currentUser.personalId as string;

    const slots = await this.drizzle.db.transaction(async (tx) => {
      await this.availabilityRepository.deleteByDay(
        personalId,
        parsed.data.dayOfWeek,
        tx,
      );

      return this.availabilityRepository.createMany(
        slotsToCreate.map((slot) => ({
          personalId,
          dayOfWeek: parsed.data.dayOfWeek,
          startTime: slot.startTime,
          endTime: slot.endTime,
        })),
        tx,
      );
    });

    return {
      dayOfWeek: parsed.data.dayOfWeek,
      slotsCreated: slots.length,
      slots,
    };
  }
}
