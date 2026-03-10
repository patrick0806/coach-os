import { BadRequestException, ConflictException, Injectable } from "@nestjs/common";

import { BookingSeriesRepository } from "@shared/repositories/booking-series.repository";
import { BookingsRepository } from "@shared/repositories/bookings.repository";
import { ServicePlansRepository } from "@shared/repositories/service-plans.repository";
import { StudentsRepository } from "@shared/repositories/students.repository";
import { DrizzleProvider } from "@shared/providers/drizzle.service";
import { IAccessToken } from "@shared/interfaces";

import {
  CreateBookingSeriesInput,
  CreateBookingSeriesSchema,
} from "./dtos/request.dto";
import { CreateBookingSeriesResponseDTO } from "./dtos/response.dto";

function toIsoDate(value: Date): string {
  const year = value.getUTCFullYear();
  const month = String(value.getUTCMonth() + 1).padStart(2, "0");
  const day = String(value.getUTCDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function buildRecurringDates(
  startDate: string,
  endDate: string,
  daysOfWeek: number[],
): string[] {
  const result: string[] = [];
  const daySet = new Set(daysOfWeek);
  let current = new Date(`${startDate}T00:00:00.000Z`);
  const end = new Date(`${endDate}T00:00:00.000Z`);

  while (current.getTime() <= end.getTime()) {
    if (daySet.has(current.getUTCDay())) {
      result.push(toIsoDate(current));
    }

    current = new Date(current);
    current.setUTCDate(current.getUTCDate() + 1);
  }

  return result;
}

@Injectable()
export class BookingSeriesService {
  constructor(
    private readonly bookingSeriesRepository: BookingSeriesRepository,
    private readonly bookingsRepository: BookingsRepository,
    private readonly servicePlansRepository: ServicePlansRepository,
    private readonly studentsRepository: StudentsRepository,
    private readonly drizzle: DrizzleProvider,
  ) {}

  async execute(
    dto: CreateBookingSeriesInput,
    currentUser: IAccessToken,
  ): Promise<CreateBookingSeriesResponseDTO> {
    const parsed = CreateBookingSeriesSchema.safeParse(dto);
    if (!parsed.success) {
      throw new BadRequestException(parsed.error.issues[0].message);
    }

    const personalId = currentUser.personalId as string;
    const {
      studentId,
      servicePlanId,
      daysOfWeek,
      startTime,
      endTime,
      seriesStartDate,
      seriesEndDate,
      notes,
    } = parsed.data;

    const student = await this.studentsRepository.findById(studentId, personalId);
    if (!student) {
      throw new BadRequestException("Aluno não encontrado ou não pertence a este personal");
    }

    const servicePlan = await this.servicePlansRepository.findOwnedById(servicePlanId, personalId);
    if (!servicePlan) {
      throw new BadRequestException("Plano de serviço não encontrado ou não pertence a este personal");
    }
    if (student.servicePlanId !== servicePlanId) {
      throw new BadRequestException("O aluno deve ser agendado com o plano de atendimento vinculado");
    }

    const recurrenceDates = buildRecurringDates(seriesStartDate, seriesEndDate, daysOfWeek);
    if (recurrenceDates.length === 0) {
      throw new BadRequestException("Nenhuma sessão pode ser gerada para os parâmetros informados");
    }

    const conflicts = await Promise.all(
      recurrenceDates.map(async (date) => {
        const conflict = await this.bookingsRepository.findConflict(personalId, date, startTime);
        return conflict ? date : null;
      }),
    );

    const conflictingDates = conflicts.filter((date): date is string => Boolean(date));
    if (conflictingDates.length > 0) {
      throw new ConflictException(
        `Conflitos de horário nas datas: ${conflictingDates.join(", ")}`,
      );
    }

    const result = await this.drizzle.db.transaction(async (tx) => {
      const series = await this.bookingSeriesRepository.create(
        {
          personalId,
          studentId,
          servicePlanId,
          daysOfWeek,
          startTime,
          endTime,
          seriesStartDate,
          seriesEndDate,
          notes: notes ?? null,
        },
        tx,
      );

      const bookings = await this.bookingsRepository.createMany(
        recurrenceDates.map((scheduledDate) => ({
          personalId,
          studentId,
          servicePlanId,
          seriesId: series.id,
          scheduledDate: new Date(`${scheduledDate}T00:00:00.000Z`),
          startTime,
          endTime,
          notes: notes ?? null,
        })),
        tx,
      );

      return { series, bookings };
    });

    return {
      series: result.series,
      bookingsCreated: result.bookings.length,
      bookings: result.bookings,
    };
  }
}
