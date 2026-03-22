import { Injectable, NotFoundException, BadRequestException } from "@nestjs/common";
import { z } from "zod";

import {
  AppointmentsRepository,
  Appointment,
} from "@shared/repositories/appointments.repository";
import { validate } from "@shared/utils/validation.util";

const cancelAppointmentSchema = z.object({
  cancellationReason: z.string().max(500).optional(),
});

@Injectable()
export class CancelAppointmentUseCase {
  constructor(
    private readonly appointmentsRepository: AppointmentsRepository,
  ) {}

  async execute(
    id: string,
    body: unknown,
    tenantId: string,
  ): Promise<Appointment> {
    const data = validate(cancelAppointmentSchema, body);

    const existing = await this.appointmentsRepository.findById(id, tenantId);
    if (!existing) {
      throw new NotFoundException("Appointment not found");
    }

    if (existing.status !== "scheduled") {
      throw new BadRequestException("Only scheduled appointments can be cancelled");
    }

    const updated = await this.appointmentsRepository.update(id, tenantId, {
      status: "cancelled",
      cancelledAt: new Date(),
      cancellationReason: data.cancellationReason,
    });

    return updated!;
  }
}
