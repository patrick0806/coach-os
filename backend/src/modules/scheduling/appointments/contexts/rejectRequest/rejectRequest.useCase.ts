import { Injectable, NotFoundException, BadRequestException } from "@nestjs/common";

import {
  AppointmentRequestsRepository,
  AppointmentRequest,
} from "@shared/repositories/appointmentRequests.repository";

@Injectable()
export class RejectAppointmentRequestUseCase {
  constructor(
    private readonly appointmentRequestsRepository: AppointmentRequestsRepository,
  ) {}

  async execute(id: string, tenantId: string): Promise<AppointmentRequest> {
    const request = await this.appointmentRequestsRepository.findById(
      id,
      tenantId,
    );
    if (!request) {
      throw new NotFoundException("Appointment request not found");
    }

    if (request.status === "rejected") {
      throw new BadRequestException("Request is already rejected");
    }

    const updated = await this.appointmentRequestsRepository.update(
      id,
      tenantId,
      { status: "rejected" },
    );

    return updated!;
  }
}
