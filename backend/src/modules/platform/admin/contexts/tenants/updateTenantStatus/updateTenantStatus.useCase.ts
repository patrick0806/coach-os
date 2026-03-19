import { Injectable, NotFoundException } from "@nestjs/common";

import { PersonalsRepository } from "@shared/repositories/personals.repository";
import { validate } from "@shared/utils/validation.util";

import { updateTenantStatusSchema } from "./dtos/request.dto";

@Injectable()
export class UpdateTenantStatusUseCase {
  constructor(private readonly personalsRepository: PersonalsRepository) {}

  async execute(id: string, body: unknown): Promise<void> {
    const { accessStatus } = validate(updateTenantStatusSchema, body);

    const personal = await this.personalsRepository.findById(id);
    if (!personal) {
      throw new NotFoundException("Tenant not found");
    }

    await this.personalsRepository.updateSubscription(id, { accessStatus });
  }
}
