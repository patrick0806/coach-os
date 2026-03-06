import { Module } from "@nestjs/common";

import { PlansRepository } from "@shared/repositories/plans.repository";

import { ListPlansController } from "./list-plans/list-plans.controller";
import { ListPlansService } from "./list-plans/list-plans.service";

@Module({
  controllers: [ListPlansController],
  providers: [ListPlansService, PlansRepository],
})
export class PlansModule {}
