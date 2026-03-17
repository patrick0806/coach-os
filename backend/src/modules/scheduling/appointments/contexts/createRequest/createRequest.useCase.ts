import { Injectable, BadRequestException } from "@nestjs/common";
import { z } from "zod";
import { isBefore, startOfDay } from "date-fns";

import {
  AppointmentRequestsRepository,
  AppointmentRequest,
} from "@shared/repositories/appointmentRequests.repository";
import { validate } from "@shared/utils/validation.util";

const createRequestSchema = z.object({
  requestedDate: z.coerce.date(),
  requestedStartTime: z
    .string()
    .regex(/^\d{2}:\d{2}$/, "Must be HH:MM format"),
  requestedEndTime: z
    .string()
    .regex(/^\d{2}:\d{2}$/, "Must be HH:MM format"),
  notes: z.string().max(500).optional(),
});

@Injectable()
export class CreateAppointmentRequestUseCase {
  constructor(
    private readonly appointmentRequestsRepository: AppointmentRequestsRepository,
  ) {}

  async execute(
    body: unknown,
    studentId: string,
    tenantId: string,
  ): Promise<AppointmentRequest> {
    const data = validate(createRequestSchema, body);

    if (data.requestedStartTime >= data.requestedEndTime) {
      throw new BadRequestException(
        "requestedStartTime must be before requestedEndTime",
      );
    }

    if (isBefore(startOfDay(data.requestedDate), startOfDay(new Date()))) {
      throw new BadRequestException("Requested date cannot be in the past");
    }

    return this.appointmentRequestsRepository.create({
      tenantId,
      studentId,
      requestedDate: data.requestedDate,
      requestedStartTime: data.requestedStartTime,
      requestedEndTime: data.requestedEndTime,
      status: "pending",
      notes: data.notes,
    });
  }
}
