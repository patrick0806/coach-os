import { Injectable, NotFoundException } from "@nestjs/common";

import { AvailabilityExceptionsRepository } from "@shared/repositories/availabilityExceptions.repository";

@Injectable()
export class DeleteAvailabilityExceptionUseCase {
  constructor(
    private readonly availabilityExceptionsRepository: AvailabilityExceptionsRepository,
  ) {}

  async execute(id: string, tenantId: string): Promise<void> {
    const existing = await this.availabilityExceptionsRepository.findById(
      id,
      tenantId,
    );
    if (!existing) {
      throw new NotFoundException("Availability exception not found");
    }

    await this.availabilityExceptionsRepository.delete(id, tenantId);
  }
}
