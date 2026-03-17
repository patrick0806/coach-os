import { Module } from "@nestjs/common";

import { PersonalsRepository } from "@shared/repositories/personals.repository";
import { ServicePlansRepository } from "@shared/repositories/servicePlans.repository";

import { GetPublicProfileController } from "./contexts/getPublicProfile/getPublicProfile.controller";
import { GetPublicProfileUseCase } from "./contexts/getPublicProfile/getPublicProfile.useCase";

@Module({
  controllers: [GetPublicProfileController],
  providers: [PersonalsRepository, ServicePlansRepository, GetPublicProfileUseCase],
})
export class PublicModule {}
