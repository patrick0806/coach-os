import { Module } from "@nestjs/common";

import { PlansRepository } from "@shared/repositories/plans.repository";

import { ListPlansController } from "./contexts/listPlans/listPlans.controller";
import { ListPlansUseCase } from "./contexts/listPlans/listPlans.useCase";

@Module({
  controllers: [ListPlansController],
  providers: [PlansRepository, ListPlansUseCase],
})
export class PlansModule {}
