import { Injectable, NotFoundException, BadRequestException } from "@nestjs/common";

import {
  AppointmentsRepository,
  Appointment,
} from "@shared/repositories/appointments.repository";

@Injectable()
export class CompleteAppointmentUseCase {
  constructor(
    private readonly appointmentsRepository: AppointmentsRepository,
  ) {}

  async execute(id: string, tenantId: string): Promise<Appointment> {
    const existing = await this.appointmentsRepository.findById(id, tenantId);
    if (!existing) {
      throw new NotFoundException("Appointment not found");
    }

    if (existing.status === "completed") {
      throw new BadRequestException("Appointment is already completed");
    }

    const updated = await this.appointmentsRepository.update(id, tenantId, {
      status: "completed",
    });

    return updated!;
  }
}
