import { Module } from "@nestjs/common";

import { PersonalsRepository } from "@shared/repositories/personals.repository";
import { ServicePlansRepository } from "@shared/repositories/servicePlans.repository";
import { AvailabilityRulesRepository } from "@shared/repositories/availabilityRules.repository";
import { TrainingSchedulesRepository } from "@shared/repositories/trainingSchedules.repository";

import { GetPublicProfileController } from "./contexts/getPublicProfile/getPublicProfile.controller";
import { GetPublicProfileUseCase } from "./contexts/getPublicProfile/getPublicProfile.useCase";

@Module({
  controllers: [GetPublicProfileController],
  providers: [PersonalsRepository, ServicePlansRepository, AvailabilityRulesRepository, TrainingSchedulesRepository, GetPublicProfileUseCase],
})
export class PublicModule {}
