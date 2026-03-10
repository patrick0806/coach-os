import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";

import { AvailabilityRepository } from "@shared/repositories/availability.repository";
import { DrizzleProvider } from "@shared/providers/drizzle.service";
import { IAccessToken } from "@shared/interfaces";

import { CopyAvailabilityInput, CopyAvailabilitySchema } from "./dtos/request.dto";
import { CopyAvailabilityResponseDTO } from "./dtos/response.dto";

@Injectable()
export class CopyAvailabilityService {
  constructor(
    private readonly availabilityRepository: AvailabilityRepository,
    private readonly drizzle: DrizzleProvider,
  ) {}

  async execute(
    dto: CopyAvailabilityInput,
    currentUser: IAccessToken,
  ): Promise<CopyAvailabilityResponseDTO> {
    const parsed = CopyAvailabilitySchema.safeParse(dto);
    if (!parsed.success) {
      throw new BadRequestException(parsed.error.issues[0].message);
    }

    const personalId = currentUser.personalId as string;
    const sourceSlots = await this.availabilityRepository.findByDay(
      personalId,
      parsed.data.sourceDayOfWeek,
    );

    if (sourceSlots.length === 0) {
      throw new NotFoundException(
        "Nenhum slot encontrado no dia de origem para copiar",
      );
    }

    let totalCreated = 0;
    const uniqueTargetDays = [...new Set(parsed.data.targetDays)];

    await this.drizzle.db.transaction(async (tx) => {
      for (const targetDay of uniqueTargetDays) {
        await this.availabilityRepository.deleteByDay(personalId, targetDay, tx);

        const created = await this.availabilityRepository.createMany(
          sourceSlots.map((slot) => ({
            personalId,
            dayOfWeek: targetDay,
            startTime: slot.startTime,
            endTime: slot.endTime,
          })),
          tx,
        );

        totalCreated += created.length;
      }
    });

    return {
      copiedToDays: uniqueTargetDays,
      totalSlotsCreated: totalCreated,
    };
  }
}
