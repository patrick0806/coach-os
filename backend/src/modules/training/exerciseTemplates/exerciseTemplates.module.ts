import { Module } from "@nestjs/common";

import { ExerciseTemplatesRepository } from "@shared/repositories/exerciseTemplates.repository";

import { UpdateExerciseTemplateController } from "./contexts/updateExerciseTemplate/updateExerciseTemplate.controller";
import { UpdateExerciseTemplateUseCase } from "./contexts/updateExerciseTemplate/updateExerciseTemplate.useCase";
import { DeleteExerciseTemplateController } from "./contexts/deleteExerciseTemplate/deleteExerciseTemplate.controller";
import { DeleteExerciseTemplateUseCase } from "./contexts/deleteExerciseTemplate/deleteExerciseTemplate.useCase";

@Module({
  controllers: [
    UpdateExerciseTemplateController,
    DeleteExerciseTemplateController,
  ],
  providers: [
    ExerciseTemplatesRepository,
    UpdateExerciseTemplateUseCase,
    DeleteExerciseTemplateUseCase,
  ],
  exports: [ExerciseTemplatesRepository],
})
export class ExerciseTemplatesModule {}
