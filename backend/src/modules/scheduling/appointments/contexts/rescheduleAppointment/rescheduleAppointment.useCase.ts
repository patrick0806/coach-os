import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from "@nestjs/common";
import { z } from "zod";

import { AppointmentsRepository, Appointment } from "@shared/repositories/appointments.repository";
import { AvailabilityRulesRepository } from "@shared/repositories/availabilityRules.repository";
import { AvailabilityExceptionsRepository } from "@shared/repositories/availabilityExceptions.repository";
import { TrainingSchedulesRepository } from "@shared/repositories/trainingSchedules.repository";
import { validate } from "@shared/utils/validation.util";
import { detectConflicts } from "../../../shared/conflictDetection.util";

const rescheduleAppointmentSchema = z.object({
  startAt: z.coerce.date(),
  endAt: z.coerce.date(),
  appointmentType: z.enum(["online", "presential"]).optional(),
  meetingUrl: z.string().max(500).optional().nullable(),
  location: z.string().max(300).optional().nullable(),
  notes: z.string().optional().nullable(),
  forceCreate: z.boolean().default(false),
});

@Injectable()
export class RescheduleAppointmentUseCase {
  constructor(
    private readonly appointmentsRepository: AppointmentsRepository,
    private readonly availabilityRulesRepository: AvailabilityRulesRepository,
    private readonly availabilityExceptionsRepository: AvailabilityExceptionsRepository,
    private readonly trainingSchedulesRepository: TrainingSchedulesRepository,
  ) {}

  async execute(
    appointmentId: string,
    body: unknown,
    tenantId: string,
  ): Promise<Appointment> {
    const data = validate(rescheduleAppointmentSchema, body);

    const appointment = await this.appointmentsRepository.findById(appointmentId, tenantId);
    if (!appointment) {
      throw new NotFoundException("Appointment not found");
    }

    if (appointment.status !== "scheduled") {
      throw new BadRequestException("Only scheduled appointments can be rescheduled");
    }

    if (data.startAt >= data.endAt) {
      throw new BadRequestException("startAt must be before endAt");
    }

    // Resolve the effective type for validation
    const effectiveType = data.appointmentType ?? appointment.appointmentType;
    if (effectiveType === "online" && !data.meetingUrl && !appointment.meetingUrl) {
      throw new BadRequestException("meetingUrl is required for online appointments");
    }
    if (effectiveType === "presential" && !data.location && !appointment.location) {
      throw new BadRequestException("location is required for presential appointments");
    }

    // Conflict detection
    const pad = (n: number) => n.toString().padStart(2, "0");
    const dateStr = `${data.startAt.getUTCFullYear()}-${pad(data.startAt.getUTCMonth() + 1)}-${pad(data.startAt.getUTCDate())}`;
    const startTime = `${pad(data.startAt.getUTCHours())}:${pad(data.startAt.getUTCMinutes())}`;
    const endTime = `${pad(data.endAt.getUTCHours())}:${pad(data.endAt.getUTCMinutes())}`;

    const [availabilityRules, availabilityExceptions, existingAppointments, trainingSchedules] =
      await Promise.all([
        this.availabilityRulesRepository.findByTenantId(tenantId),
        this.availabilityExceptionsRepository.findByDateRange(tenantId, dateStr, dateStr),
        this.appointmentsRepository.findOverlapping(tenantId, data.startAt, data.endAt, appointmentId),
        this.trainingSchedulesRepository.findByTenantId(tenantId),
      ]);

    const conflicts = detectConflicts({
      date: data.startAt,
      startTime,
      endTime,
      availabilityRules,
      availabilityExceptions,
      existingAppointments,
      trainingSchedules,
    });

    if (conflicts.length > 0 && !data.forceCreate) {
      throw new ConflictException({
        message: "Appointment has conflicts",
        conflicts,
      });
    }

    // Build update payload — only include fields that were explicitly provided
    const updateData: Record<string, unknown> = {
      startAt: data.startAt,
      endAt: data.endAt,
    };

    if (data.appointmentType !== undefined) {
      updateData.appointmentType = data.appointmentType;
    }
    if (data.meetingUrl !== undefined) {
      updateData.meetingUrl = data.meetingUrl;
    }
    if (data.location !== undefined) {
      updateData.location = data.location;
    }
    if (data.notes !== undefined) {
      updateData.notes = data.notes;
    }

    const updated = await this.appointmentsRepository.update(
      appointmentId,
      tenantId,
      updateData as any,
    );

    return updated!;
  }
}
