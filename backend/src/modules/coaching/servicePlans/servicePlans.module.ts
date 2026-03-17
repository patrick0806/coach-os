import { Module } from "@nestjs/common";

import { ServicePlansRepository } from "@shared/repositories/servicePlans.repository";

import { CreateServicePlanController } from "./contexts/createServicePlan/createServicePlan.controller";
import { CreateServicePlanUseCase } from "./contexts/createServicePlan/createServicePlan.useCase";
import { ListServicePlansController } from "./contexts/listServicePlans/listServicePlans.controller";
import { ListServicePlansUseCase } from "./contexts/listServicePlans/listServicePlans.useCase";
import { GetServicePlanController } from "./contexts/getServicePlan/getServicePlan.controller";
import { GetServicePlanUseCase } from "./contexts/getServicePlan/getServicePlan.useCase";
import { UpdateServicePlanController } from "./contexts/updateServicePlan/updateServicePlan.controller";
import { UpdateServicePlanUseCase } from "./contexts/updateServicePlan/updateServicePlan.useCase";
import { DeleteServicePlanController } from "./contexts/deleteServicePlan/deleteServicePlan.controller";
import { DeleteServicePlanUseCase } from "./contexts/deleteServicePlan/deleteServicePlan.useCase";

@Module({
  controllers: [
    CreateServicePlanController,
    ListServicePlansController,
    GetServicePlanController,
    UpdateServicePlanController,
    DeleteServicePlanController,
  ],
  providers: [
    ServicePlansRepository,
    CreateServicePlanUseCase,
    ListServicePlansUseCase,
    GetServicePlanUseCase,
    UpdateServicePlanUseCase,
    DeleteServicePlanUseCase,
  ],
  exports: [ServicePlansRepository],
})
export class ServicePlansModule {}
