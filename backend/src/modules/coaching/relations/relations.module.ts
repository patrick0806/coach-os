import { Module } from "@nestjs/common";

import { CoachStudentRelationsRepository } from "@shared/repositories/coachStudentRelations.repository";

import { ListRelationsController } from "./contexts/listRelations/listRelations.controller";
import { ListRelationsUseCase } from "./contexts/listRelations/listRelations.useCase";
import { UpdateRelationStatusController } from "./contexts/updateRelationStatus/updateRelationStatus.controller";
import { UpdateRelationStatusUseCase } from "./contexts/updateRelationStatus/updateRelationStatus.useCase";

@Module({
  controllers: [ListRelationsController, UpdateRelationStatusController],
  providers: [
    CoachStudentRelationsRepository,
    ListRelationsUseCase,
    UpdateRelationStatusUseCase,
  ],
})
export class CoachingRelationsModule {}
