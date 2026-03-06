import { Module } from "@nestjs/common";

import { PersonalsRepository } from "@shared/repositories/personals.repository";
import { UsersRepository } from "@shared/repositories/users.repository";
import { AdminPersonalsRepository } from "@shared/repositories/admin-personals.repository";
import { PlansRepository } from "@shared/repositories/plans.repository";
import { DashboardRepository } from "@shared/repositories/dashboard.repository";

import { ListPersonalsController } from "./personals/list-personals/list-personals.controller";
import { ListPersonalsService } from "./personals/list-personals/list-personals.service";
import { GetPersonalController } from "./personals/get-personal/get-personal.controller";
import { GetPersonalService } from "./personals/get-personal/get-personal.service";
import { TogglePersonalStatusController } from "./personals/toggle-personal-status/toggle-personal-status.controller";
import { TogglePersonalStatusService } from "./personals/toggle-personal-status/toggle-personal-status.service";

import { CreatePlanController } from "./plans/create-plan/create-plan.controller";
import { CreatePlanService } from "./plans/create-plan/create-plan.service";
import { ListAdminPlansController } from "./plans/list-plans/list-admin-plans.controller";
import { ListAdminPlansService } from "./plans/list-plans/list-admin-plans.service";
import { UpdatePlanController } from "./plans/update-plan/update-plan.controller";
import { UpdatePlanService } from "./plans/update-plan/update-plan.service";
import { TogglePlanStatusController } from "./plans/toggle-plan-status/toggle-plan-status.controller";
import { TogglePlanStatusService } from "./plans/toggle-plan-status/toggle-plan-status.service";
import { ReorderPlansController } from "./plans/reorder-plans/reorder-plans.controller";
import { ReorderPlansService } from "./plans/reorder-plans/reorder-plans.service";

import { GetStatsController } from "./dashboard/get-stats/get-stats.controller";
import { GetStatsService } from "./dashboard/get-stats/get-stats.service";
import { GetChartsController } from "./dashboard/get-charts/get-charts.controller";
import { GetChartsService } from "./dashboard/get-charts/get-charts.service";

@Module({
  controllers: [
    ListPersonalsController,
    GetPersonalController,
    TogglePersonalStatusController,
    CreatePlanController,
    ListAdminPlansController,
    UpdatePlanController,
    TogglePlanStatusController,
    ReorderPlansController,
    GetStatsController,
    GetChartsController,
  ],
  providers: [
    ListPersonalsService,
    GetPersonalService,
    TogglePersonalStatusService,
    CreatePlanService,
    ListAdminPlansService,
    UpdatePlanService,
    TogglePlanStatusService,
    ReorderPlansService,
    GetStatsService,
    GetChartsService,
    AdminPersonalsRepository,
    PersonalsRepository,
    UsersRepository,
    PlansRepository,
    DashboardRepository,
  ],
})
export class AdminModule {}
