import { Module } from "@nestjs/common";

import { AdminsRepository } from "@shared/repositories/admins.repository";
import { CoachInvitationTokensRepository } from "@shared/repositories/coachInvitationTokens.repository";
import { PersonalsRepository } from "@shared/repositories/personals.repository";
import { PlansRepository } from "@shared/repositories/plans.repository";
import { ResendProvider } from "@shared/providers/resend.provider";
import { StudentsRepository } from "@shared/repositories/students.repository";
import { UsersRepository } from "@shared/repositories/users.repository";

import { GetDashboardStatsController } from "./contexts/getDashboardStats/getDashboardStats.controller";
import { GetDashboardStatsUseCase } from "./contexts/getDashboardStats/getDashboardStats.useCase";

import { ListPlansController } from "./contexts/plans/listPlans/listPlans.controller";
import { ListPlansUseCase } from "./contexts/plans/listPlans/listPlans.useCase";
import { CreatePlanController } from "./contexts/plans/createPlan/createPlan.controller";
import { CreatePlanUseCase } from "./contexts/plans/createPlan/createPlan.useCase";
import { UpdatePlanController } from "./contexts/plans/updatePlan/updatePlan.controller";
import { UpdatePlanUseCase } from "./contexts/plans/updatePlan/updatePlan.useCase";
import { DeletePlanController } from "./contexts/plans/deletePlan/deletePlan.controller";
import { DeletePlanUseCase } from "./contexts/plans/deletePlan/deletePlan.useCase";

import { ListWhitelistedController } from "./contexts/whitelist/listWhitelisted/listWhitelisted.controller";
import { ListWhitelistedUseCase } from "./contexts/whitelist/listWhitelisted/listWhitelisted.useCase";
import { AddToWhitelistController } from "./contexts/whitelist/addToWhitelist/addToWhitelist.controller";
import { AddToWhitelistUseCase } from "./contexts/whitelist/addToWhitelist/addToWhitelist.useCase";
import { RemoveFromWhitelistController } from "./contexts/whitelist/removeFromWhitelist/removeFromWhitelist.controller";
import { RemoveFromWhitelistUseCase } from "./contexts/whitelist/removeFromWhitelist/removeFromWhitelist.useCase";

import { ListAdminsController } from "./contexts/admins/listAdmins/listAdmins.controller";
import { ListAdminsUseCase } from "./contexts/admins/listAdmins/listAdmins.useCase";
import { CreateAdminController } from "./contexts/admins/createAdmin/createAdmin.controller";
import { CreateAdminUseCase } from "./contexts/admins/createAdmin/createAdmin.useCase";
import { DeleteAdminController } from "./contexts/admins/deleteAdmin/deleteAdmin.controller";
import { DeleteAdminUseCase } from "./contexts/admins/deleteAdmin/deleteAdmin.useCase";

import { ListTenantsController } from "./contexts/tenants/listTenants/listTenants.controller";
import { ListTenantsUseCase } from "./contexts/tenants/listTenants/listTenants.useCase";
import { GetTenantController } from "./contexts/tenants/getTenant/getTenant.controller";
import { GetTenantUseCase } from "./contexts/tenants/getTenant/getTenant.useCase";
import { UpdateTenantStatusController } from "./contexts/tenants/updateTenantStatus/updateTenantStatus.controller";
import { UpdateTenantStatusUseCase } from "./contexts/tenants/updateTenantStatus/updateTenantStatus.useCase";

import { InviteCoachController } from "./contexts/coaches/inviteCoach/inviteCoach.controller";
import { InviteCoachUseCase } from "./contexts/coaches/inviteCoach/inviteCoach.useCase";

@Module({
  controllers: [
    GetDashboardStatsController,
    ListPlansController,
    CreatePlanController,
    UpdatePlanController,
    DeletePlanController,
    ListWhitelistedController,
    AddToWhitelistController,
    RemoveFromWhitelistController,
    ListAdminsController,
    CreateAdminController,
    DeleteAdminController,
    ListTenantsController,
    GetTenantController,
    UpdateTenantStatusController,
    InviteCoachController,
  ],
  providers: [
    AdminsRepository,
    PersonalsRepository,
    PlansRepository,
    StudentsRepository,
    UsersRepository,
    GetDashboardStatsUseCase,
    ListPlansUseCase,
    CreatePlanUseCase,
    UpdatePlanUseCase,
    DeletePlanUseCase,
    ListWhitelistedUseCase,
    AddToWhitelistUseCase,
    RemoveFromWhitelistUseCase,
    ListAdminsUseCase,
    CreateAdminUseCase,
    DeleteAdminUseCase,
    ListTenantsUseCase,
    GetTenantUseCase,
    UpdateTenantStatusUseCase,
    InviteCoachUseCase,
    CoachInvitationTokensRepository,
    ResendProvider,
  ],
})
export class AdminModule {}
