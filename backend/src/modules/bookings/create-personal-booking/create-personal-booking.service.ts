import { BadRequestException, ConflictException, Injectable } from "@nestjs/common";

import { BookingsRepository } from "@shared/repositories/bookings.repository";
import { ServicePlansRepository } from "@shared/repositories/service-plans.repository";
import { StudentsRepository } from "@shared/repositories/students.repository";
import { IAccessToken } from "@shared/interfaces";
import { Booking } from "@config/database/schema/availability";

import {
  CreatePersonalBookingInput,
  CreatePersonalBookingSchema,
} from "./dtos/request.dto";

@Injectable()
export class CreatePersonalBookingService {
  constructor(
    private readonly bookingsRepository: BookingsRepository,
    private readonly servicePlansRepository: ServicePlansRepository,
    private readonly studentsRepository: StudentsRepository,
  ) {}

  async execute(
    dto: CreatePersonalBookingInput,
    currentUser: IAccessToken,
  ): Promise<Booking> {
    const parsed = CreatePersonalBookingSchema.safeParse(dto);
    if (!parsed.success) {
      throw new BadRequestException(parsed.error.issues[0].message);
    }

    const personalId = currentUser.personalId as string;
    const { studentId, servicePlanId, scheduledDate, startTime, endTime, notes } = parsed.data;

    const student = await this.studentsRepository.findById(studentId, personalId);
    if (!student) {
      throw new BadRequestException("Aluno não encontrado ou não pertence a este personal");
    }

    const servicePlan = await this.servicePlansRepository.findOwnedById(servicePlanId, personalId);
    if (!servicePlan) {
      throw new BadRequestException("Plano de serviço não encontrado ou não pertence a este personal");
    }

    const conflict = await this.bookingsRepository.findConflict(personalId, scheduledDate, startTime);
    if (conflict) {
      throw new ConflictException("Já existe um agendamento neste horário");
    }

    return this.bookingsRepository.create({
      personalId,
      studentId,
      servicePlanId,
      scheduledDate: new Date(scheduledDate + "T00:00:00Z"),
      startTime,
      endTime,
      notes: notes ?? null,
    });
  }
}
