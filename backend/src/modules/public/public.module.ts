import { Module } from "@nestjs/common";

import { PersonalsRepository } from "@shared/repositories/personals.repository";
import { ServicePlansRepository } from "@shared/repositories/servicePlans.repository";
import { WorkingHoursRepository } from "@shared/repositories/workingHours.repository";
import { RecurringSlotsRepository } from "@shared/repositories/recurringSlots.repository";

import { GetPublicProfileController } from "./contexts/getPublicProfile/getPublicProfile.controller";
import { GetPublicProfileUseCase } from "./contexts/getPublicProfile/getPublicProfile.useCase";

@Module({
  controllers: [GetPublicProfileController],
  providers: [PersonalsRepository, ServicePlansRepository, WorkingHoursRepository, RecurringSlotsRepository, GetPublicProfileUseCase],
})
export class PublicModule {}
