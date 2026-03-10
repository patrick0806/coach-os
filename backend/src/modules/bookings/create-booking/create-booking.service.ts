import { BadRequestException, ConflictException, Injectable } from "@nestjs/common";

import { BookingsRepository } from "@shared/repositories/bookings.repository";
import { ServicePlansRepository } from "@shared/repositories/service-plans.repository";
import { StudentsRepository } from "@shared/repositories/students.repository";
import { ResendProvider } from "@shared/providers/resend.provider";
import { IAccessToken } from "@shared/interfaces";
import { Booking } from "@config/database/schema/availability";

import { CreateBookingSchema, CreateBookingInput } from "./dtos/request.dto";

@Injectable()
export class CreateBookingService {
  constructor(
    private readonly bookingsRepository: BookingsRepository,
    private readonly servicePlansRepository: ServicePlansRepository,
    private readonly studentsRepository: StudentsRepository,
    private readonly resendProvider: ResendProvider,
  ) {}

  async execute(dto: CreateBookingInput, currentUser: IAccessToken): Promise<Booking> {
    const parsed = CreateBookingSchema.safeParse(dto);
    if (!parsed.success) {
      throw new BadRequestException(parsed.error.issues[0].message);
    }

    const { servicePlanId, scheduledDate, startTime, endTime, notes } = parsed.data;
    const personalId = currentUser.personalId as string;
    const studentId = currentUser.profileId as string;
    const student = await this.studentsRepository.findById(studentId, personalId);
    if (!student) {
      throw new BadRequestException("Aluno não encontrado");
    }

    // Validate that service plan belongs to this personal (tenant)
    const plan = await this.servicePlansRepository.findById(servicePlanId);
    if (!plan || plan.personalId !== personalId) {
      throw new BadRequestException("Plano de serviço não encontrado ou não pertence a este personal");
    }
    if (student.servicePlanId !== servicePlanId) {
      throw new BadRequestException("Você só pode agendar sessões com o seu plano vinculado");
    }

    // Check for conflicting booking
    const conflict = await this.bookingsRepository.findConflict(personalId, scheduledDate, startTime);
    if (conflict) {
      throw new ConflictException("Já existe um agendamento neste horário");
    }

    const booking = await this.bookingsRepository.create({
      personalId,
      studentId,
      servicePlanId,
      scheduledDate: new Date(scheduledDate + "T00:00:00Z"),
      startTime,
      endTime,
      notes: notes ?? null,
    });

    // Send emails asynchronously (fire and forget — failures must not break booking)
    this.resendProvider.sendBookingConfirmation({
      to: currentUser.sub,
      studentName: studentId,
      personalName: personalId,
      scheduledDate,
      startTime,
      endTime,
      servicePlanName: plan.name,
    }).catch(() => { /* swallowed — email failures are non-critical */ });

    return booking;
  }
}
