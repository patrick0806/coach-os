import { Injectable } from "@nestjs/common";
import { z } from "zod";

import {
  AppointmentsRepository,
  AppointmentWithStudent,
} from "@shared/repositories/appointments.repository";
import { validate } from "@shared/utils/validation.util";
import { Page } from "@shared/interfaces/pagenation.interface";

const listAppointmentsSchema = z.object({
  page: z.coerce.number().int().min(0).default(0),
  size: z.coerce.number().int().min(1).max(100).default(10),
  startDate: z.coerce.date().optional(),
  endDate: z.coerce.date().optional(),
  status: z.string().optional(),
  studentId: z.string().optional(),
});

@Injectable()
export class ListAppointmentsUseCase {
  constructor(
    private readonly appointmentsRepository: AppointmentsRepository,
  ) {}

  async execute(
    query: unknown,
    tenantId: string,
  ): Promise<Page<AppointmentWithStudent>> {
    const params = validate(listAppointmentsSchema, query);

    const { rows, total } = await this.appointmentsRepository.findAllByTenantId(
      tenantId,
      {
        page: params.page,
        size: params.size,
        startDate: params.startDate,
        endDate: params.endDate,
        status: params.status,
        studentId: params.studentId,
      },
    );

    return {
      content: rows,
      page: params.page,
      size: params.size,
      totalElements: total,
      totalPages: Math.ceil(total / params.size),
    };
  }
}
