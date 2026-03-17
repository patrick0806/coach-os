import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from "@nestjs/common";
import { z } from "zod";
import {
  AppointmentsRepository,
  Appointment,
} from "@shared/repositories/appointments.repository";
import { StudentsRepository } from "@shared/repositories/students.repository";
import { AvailabilityRulesRepository } from "@shared/repositories/availabilityRules.repository";
import { AvailabilityExceptionsRepository } from "@shared/repositories/availabilityExceptions.repository";
import { TrainingSchedulesRepository } from "@shared/repositories/trainingSchedules.repository";
import { validate } from "@shared/utils/validation.util";
import { detectConflicts } from "../../../shared/conflictDetection.util";

const createAppointmentSchema = z
  .object({
    studentId: z.string().min(1),
    startAt: z.coerce.date(),
    endAt: z.coerce.date(),
    appointmentType: z.enum(["online", "presential"]),
    meetingUrl: z.string().max(500).optional(),
    location: z.string().max(300).optional(),
    notes: z.string().optional(),
    forceCreate: z.boolean().default(false),
  })
  .refine(
    (data) => {
      if (data.appointmentType === "online" && !data.meetingUrl) {
        return false;
      }
      return true;
    },
    { message: "meetingUrl is required for online appointments", path: ["meetingUrl"] },
  )
  .refine(
    (data) => {
      if (data.appointmentType === "presential" && !data.location) {
        return false;
      }
      return true;
    },
    { message: "location is required for presential appointments", path: ["location"] },
  );

@Injectable()
export class CreateAppointmentUseCase {
  constructor(
    private readonly appointmentsRepository: AppointmentsRepository,
    private readonly studentsRepository: StudentsRepository,
    private readonly availabilityRulesRepository: AvailabilityRulesRepository,
    private readonly availabilityExceptionsRepository: AvailabilityExceptionsRepository,
    private readonly trainingSchedulesRepository: TrainingSchedulesRepository,
  ) {}

  async execute(
    body: unknown,
    tenantId: string,
  ): Promise<Appointment & { conflicts?: unknown[] }> {
    const data = validate(createAppointmentSchema, body);

    const student = await this.studentsRepository.findById(
      data.studentId,
      tenantId,
    );
    if (!student) {
      throw new NotFoundException("Student not found");
    }

    if (data.startAt >= data.endAt) {
      throw new BadRequestException("startAt must be before endAt");
    }

    const pad = (n: number) => n.toString().padStart(2, "0");
    const dateStr = `${data.startAt.getUTCFullYear()}-${pad(data.startAt.getUTCMonth() + 1)}-${pad(data.startAt.getUTCDate())}`;
    const startTime = `${pad(data.startAt.getUTCHours())}:${pad(data.startAt.getUTCMinutes())}`;
    const endTime = `${pad(data.endAt.getUTCHours())}:${pad(data.endAt.getUTCMinutes())}`;

    const [availabilityRules, availabilityExceptions, existingAppointments, trainingSchedules] =
      await Promise.all([
        this.availabilityRulesRepository.findByTenantId(tenantId),
        this.availabilityExceptionsRepository.findByDateRange(tenantId, dateStr, dateStr),
        this.appointmentsRepository.findOverlapping(tenantId, data.startAt, data.endAt),
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

    const appointment = await this.appointmentsRepository.create({
      tenantId,
      studentId: data.studentId,
      startAt: data.startAt,
      endAt: data.endAt,
      appointmentType: data.appointmentType,
      status: "scheduled",
      meetingUrl: data.meetingUrl,
      location: data.location,
      notes: data.notes,
    });

    return appointment;
  }
}
