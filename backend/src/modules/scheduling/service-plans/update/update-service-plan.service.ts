import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";

import { ServicePlansRepository } from "@shared/repositories/service-plans.repository";
import { IAccessToken } from "@shared/interfaces";
import { ServicePlan } from "@config/database/schema/availability";

import { UpdateServicePlanSchema, UpdateServicePlanInput } from "./dtos/request.dto";

@Injectable()
export class UpdateServicePlanService {
  constructor(private readonly servicePlansRepository: ServicePlansRepository) {}

  async execute(
    id: string,
    dto: UpdateServicePlanInput,
    currentUser: IAccessToken,
  ): Promise<ServicePlan> {
    const parsed = UpdateServicePlanSchema.safeParse(dto);
    if (!parsed.success) {
      throw new BadRequestException(parsed.error.issues[0].message);
    }

    const plan = await this.servicePlansRepository.findOwnedById(
      id,
      currentUser.personalId as string,
    );
    if (!plan) {
      throw new NotFoundException("Plano de serviço não encontrado");
    }

    const updateData: Record<string, unknown> = { ...parsed.data };

    // Convert price number to string if present
    if (parsed.data.price !== undefined) {
      updateData.price = parsed.data.price.toFixed(2);
    }

    const updated = await this.servicePlansRepository.update(
      id,
      currentUser.personalId as string,
      updateData as any, // eslint-disable-line @typescript-eslint/no-explicit-any
    );

    return updated as ServicePlan;
  }
}
