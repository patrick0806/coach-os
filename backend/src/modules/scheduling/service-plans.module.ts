import { Module } from "@nestjs/common";

import { ServicePlansRepository } from "@shared/repositories/service-plans.repository";

import { ListServicePlansController } from "./service-plans/list/list-service-plans.controller";
import { ListServicePlansService } from "./service-plans/list/list-service-plans.service";
import { CreateServicePlanController } from "./service-plans/create/create-service-plan.controller";
import { CreateServicePlanService } from "./service-plans/create/create-service-plan.service";
import { UpdateServicePlanController } from "./service-plans/update/update-service-plan.controller";
import { UpdateServicePlanService } from "./service-plans/update/update-service-plan.service";
import { DeactivateServicePlanController } from "./service-plans/deactivate/deactivate-service-plan.controller";
import { DeactivateServicePlanService } from "./service-plans/deactivate/deactivate-service-plan.service";

@Module({
  controllers: [
    ListServicePlansController,
    CreateServicePlanController,
    UpdateServicePlanController,
    DeactivateServicePlanController,
  ],
  providers: [
    ListServicePlansService,
    CreateServicePlanService,
    UpdateServicePlanService,
    DeactivateServicePlanService,
    ServicePlansRepository,
  ],
})
export class ServicePlansModule {}
