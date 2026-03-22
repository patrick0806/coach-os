import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from "@nestjs/common";
import { z } from "zod";

import {
  AppointmentRequestsRepository,
} from "@shared/repositories/appointmentRequests.repository";
import {
  AppointmentsRepository,
  Appointment,
} from "@shared/repositories/appointments.repository";
import { DrizzleProvider } from "@shared/providers/drizzle.service";
import { AvailabilityRulesRepository } from "@shared/repositories/availabilityRules.repository";
import { AvailabilityExceptionsRepository } from "@shared/repositories/availabilityExceptions.repository";
import { TrainingSchedulesRepository } from "@shared/repositories/trainingSchedules.repository";
import { TrainingScheduleExceptionsRepository } from "@shared/repositories/trainingScheduleExceptions.repository";
import { validate } from "@shared/utils/validation.util";
import { detectConflicts } from "../../../shared/conflictDetection.util";

const approveRequestSchema = z.object({
  appointmentType: z.enum(["online", "presential"]),
  meetingUrl: z.string().max(500).optional(),
  location: z.string().max(300).optional(),
  forceCreate: z.boolean().default(false),
});

@Injectable()
export class ApproveAppointmentRequestUseCase {
  constructor(
    private readonly appointmentRequestsRepository: AppointmentRequestsRepository,
    private readonly appointmentsRepository: AppointmentsRepository,
    private readonly availabilityRulesRepository: AvailabilityRulesRepository,
    private readonly availabilityExceptionsRepository: AvailabilityExceptionsRepository,
    private readonly trainingSchedulesRepository: TrainingSchedulesRepository,
    private readonly trainingScheduleExceptionsRepository: TrainingScheduleExceptionsRepository,
    private readonly drizzle: DrizzleProvider,
  ) {}

  async execute(
    id: string,
    body: unknown,
    tenantId: string,
  ): Promise<Appointment> {
    const data = validate(approveRequestSchema, body);

    const request = await this.appointmentRequestsRepository.findById(
      id,
      tenantId,
    );
    if (!request) {
      throw new NotFoundException("Appointment request not found");
    }

    if (request.status === "approved") {
      throw new BadRequestException("Request is already approved");
    }

    if (request.status === "rejected") {
      throw new BadRequestException("Request is already rejected");
    }

    const requestedDate = request.requestedDate;
    const pad = (n: number) => n.toString().padStart(2, "0");
    const dateStr = `${requestedDate.getUTCFullYear()}-${pad(requestedDate.getUTCMonth() + 1)}-${pad(requestedDate.getUTCDate())}`;

    const startAt = new Date(`${dateStr}T${request.requestedStartTime}:00Z`);
    const endAt = new Date(`${dateStr}T${request.requestedEndTime}:00Z`);

    const [availabilityRules, availabilityExceptions, existingAppointments, trainingSchedules] =
      await Promise.all([
        this.availabilityRulesRepository.findByTenantId(tenantId),
        this.availabilityExceptionsRepository.findByDateRange(tenantId, dateStr, dateStr),
        this.appointmentsRepository.findOverlapping(tenantId, startAt, endAt),
        this.trainingSchedulesRepository.findByTenantId(tenantId),
      ]);

    const scheduleIds = trainingSchedules.map((s) => s.id);
    const trainingScheduleExceptions = scheduleIds.length > 0
      ? await this.trainingScheduleExceptionsRepository.findByScheduleIdsAndDateRange(scheduleIds, dateStr, dateStr, tenantId)
      : [];

    const conflicts = detectConflicts({
      date: requestedDate,
      startTime: request.requestedStartTime,
      endTime: request.requestedEndTime,
      availabilityRules,
      availabilityExceptions,
      existingAppointments,
      trainingSchedules,
      trainingScheduleExceptions,
    });

    if (conflicts.length > 0 && !data.forceCreate) {
      throw new ConflictException({
        message: "Appointment has conflicts",
        conflicts,
      });
    }

    // CHK-021: Wrap in transaction to prevent orphaned approved request without appointment
    let appointment: Appointment | undefined;
    await this.drizzle.db.transaction(async (tx) => {
      await this.appointmentRequestsRepository.update(id, tenantId, {
        status: "approved",
      }, tx);

      appointment = await this.appointmentsRepository.create({
        tenantId,
        studentId: request.studentId,
        appointmentRequestId: id,
        startAt,
        endAt,
        appointmentType: data.appointmentType,
        status: "scheduled",
        meetingUrl: data.meetingUrl,
        location: data.location,
      }, tx);
    });

    return appointment!;
  }
}
