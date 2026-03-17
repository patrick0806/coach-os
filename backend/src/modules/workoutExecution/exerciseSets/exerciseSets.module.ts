import { Module } from "@nestjs/common";

import { DrizzleProvider } from "@shared/providers/drizzle.service";
import { ExerciseExecutionsRepository } from "@shared/repositories/exerciseExecutions.repository";
import { ExerciseSetsRepository } from "@shared/repositories/exerciseSets.repository";

import { RecordExerciseSetController } from "./contexts/recordSet/recordSet.controller";
import { RecordExerciseSetUseCase } from "./contexts/recordSet/recordSet.useCase";

@Module({
  controllers: [RecordExerciseSetController],
  providers: [
    DrizzleProvider,
    ExerciseExecutionsRepository,
    ExerciseSetsRepository,
    RecordExerciseSetUseCase,
  ],
})
export class ExerciseSetsModule {}
