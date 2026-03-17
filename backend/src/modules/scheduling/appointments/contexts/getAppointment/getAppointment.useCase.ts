import { Injectable, NotFoundException } from "@nestjs/common";

import {
  AppointmentsRepository,
  Appointment,
} from "@shared/repositories/appointments.repository";

@Injectable()
export class GetAppointmentUseCase {
  constructor(
    private readonly appointmentsRepository: AppointmentsRepository,
  ) {}

  async execute(id: string, tenantId: string): Promise<Appointment> {
    const appointment = await this.appointmentsRepository.findById(
      id,
      tenantId,
    );
    if (!appointment) {
      throw new NotFoundException("Appointment not found");
    }

    return appointment;
  }
}
