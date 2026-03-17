import { Injectable, BadRequestException } from "@nestjs/common";
import { z } from "zod";
import { isBefore, startOfDay } from "date-fns";

import {
  AvailabilityExceptionsRepository,
  AvailabilityException,
} from "@shared/repositories/availabilityExceptions.repository";
import { validate } from "@shared/utils/validation.util";

const createExceptionSchema = z.object({
  exceptionDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Must be YYYY-MM-DD format"),
  reason: z.string().max(500).optional(),
});

@Injectable()
export class CreateAvailabilityExceptionUseCase {
  constructor(
    private readonly availabilityExceptionsRepository: AvailabilityExceptionsRepository,
  ) {}

  async execute(
    body: unknown,
    tenantId: string,
  ): Promise<AvailabilityException> {
    const data = validate(createExceptionSchema, body);

    const exceptionDate = new Date(data.exceptionDate);
    if (isBefore(startOfDay(exceptionDate), startOfDay(new Date()))) {
      throw new BadRequestException("Exception date cannot be in the past");
    }

    return this.availabilityExceptionsRepository.create({
      tenantId,
      exceptionDate: data.exceptionDate,
      reason: data.reason,
    });
  }
}
