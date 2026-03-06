import { Injectable } from "@nestjs/common";

import { ServicePlansRepository } from "@shared/repositories/service-plans.repository";
import { IAccessToken } from "@shared/interfaces";
import { ServicePlan } from "@config/database/schema/availability";

@Injectable()
export class ListServicePlansService {
  constructor(private readonly servicePlansRepository: ServicePlansRepository) {}

  async execute(currentUser: IAccessToken): Promise<ServicePlan[]> {
    return this.servicePlansRepository.findAllByPersonalId(currentUser.personalId as string);
  }
}
