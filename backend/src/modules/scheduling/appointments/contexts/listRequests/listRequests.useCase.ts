import { Injectable } from "@nestjs/common";
import { z } from "zod";

import {
  AppointmentRequestsRepository,
  AppointmentRequestWithStudent,
} from "@shared/repositories/appointmentRequests.repository";
import { validate } from "@shared/utils/validation.util";
import { Page } from "@shared/interfaces/pagenation.interface";

const listRequestsSchema = z.object({
  page: z.coerce.number().int().min(0).default(0),
  size: z.coerce.number().int().min(1).max(100).default(10),
  status: z.string().optional(),
});

@Injectable()
export class ListAppointmentRequestsUseCase {
  constructor(
    private readonly appointmentRequestsRepository: AppointmentRequestsRepository,
  ) {}

  async execute(
    query: unknown,
    tenantId: string,
  ): Promise<Page<AppointmentRequestWithStudent>> {
    const params = validate(listRequestsSchema, query);

    const { rows, total } =
      await this.appointmentRequestsRepository.findAllByTenantId(tenantId, {
        page: params.page,
        size: params.size,
        status: params.status,
      });

    return {
      content: rows,
      page: params.page,
      size: params.size,
      totalElements: total,
      totalPages: Math.ceil(total / params.size),
    };
  }
}
