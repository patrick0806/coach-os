import { Injectable } from "@nestjs/common";
import { z } from "zod";

import { PersonalsRepository } from "@shared/repositories/personals.repository";
import { validate } from "@shared/utils/validation.util";

import { ListTenantsResponseDTO } from "./dtos/response.dto";

const listTenantsSchema = z.object({
  page: z.coerce.number().int().min(0).default(0),
  size: z.coerce.number().int().min(1).max(100).default(20),
  search: z.string().optional(),
});

@Injectable()
export class ListTenantsUseCase {
  constructor(private readonly personalsRepository: PersonalsRepository) {}

  async execute(query: unknown): Promise<ListTenantsResponseDTO> {
    const { page, size, search } = validate(listTenantsSchema, query);

    const { rows, total } = await this.personalsRepository.findAllPaginated({ page, size, search });

    return {
      content: rows.map((p) => ({
        id: p.id,
        name: p.name,
        email: p.email,
        slug: p.slug,
        accessStatus: p.accessStatus,
        subscriptionPlanId: p.subscriptionPlanId ?? null,
        isWhitelisted: p.isWhitelisted,
        onboardingCompleted: p.onboardingCompleted,
        createdAt: p.createdAt,
      })),
      page,
      size,
      totalElements: total,
      totalPages: Math.ceil(total / size),
    };
  }
}
