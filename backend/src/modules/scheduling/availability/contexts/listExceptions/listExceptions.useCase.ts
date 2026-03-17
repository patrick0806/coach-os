import { Injectable } from "@nestjs/common";
import { z } from "zod";

import {
  AvailabilityExceptionsRepository,
  AvailabilityException,
} from "@shared/repositories/availabilityExceptions.repository";
import { validate } from "@shared/utils/validation.util";

const listExceptionsSchema = z.object({
  startDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Must be YYYY-MM-DD format")
    .optional(),
  endDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Must be YYYY-MM-DD format")
    .optional(),
});

@Injectable()
export class ListAvailabilityExceptionsUseCase {
  constructor(
    private readonly availabilityExceptionsRepository: AvailabilityExceptionsRepository,
  ) {}

  async execute(
    query: unknown,
    tenantId: string,
  ): Promise<AvailabilityException[]> {
    const params = validate(listExceptionsSchema, query);

    if (params.startDate && params.endDate) {
      return this.availabilityExceptionsRepository.findByDateRange(
        tenantId,
        params.startDate,
        params.endDate,
      );
    }

    return this.availabilityExceptionsRepository.findByTenantId(tenantId);
  }
}
