import { Module } from "@nestjs/common";

import { WorkoutTemplatesRepository } from "@shared/repositories/workoutTemplates.repository";
import { ExerciseTemplatesRepository } from "@shared/repositories/exerciseTemplates.repository";
import { ExercisesRepository } from "@shared/repositories/exercises.repository";

import { UpdateWorkoutTemplateController } from "./contexts/updateWorkoutTemplate/updateWorkoutTemplate.controller";
import { UpdateWorkoutTemplateUseCase } from "./contexts/updateWorkoutTemplate/updateWorkoutTemplate.useCase";
import { DeleteWorkoutTemplateController } from "./contexts/deleteWorkoutTemplate/deleteWorkoutTemplate.controller";
import { DeleteWorkoutTemplateUseCase } from "./contexts/deleteWorkoutTemplate/deleteWorkoutTemplate.useCase";
import { AddExerciseTemplateController } from "./contexts/addExerciseTemplate/addExerciseTemplate.controller";
import { AddExerciseTemplateUseCase } from "./contexts/addExerciseTemplate/addExerciseTemplate.useCase";
import { ReorderExerciseTemplatesController } from "./contexts/reorderExerciseTemplates/reorderExerciseTemplates.controller";
import { ReorderExerciseTemplatesUseCase } from "./contexts/reorderExerciseTemplates/reorderExerciseTemplates.useCase";

@Module({
  controllers: [
    UpdateWorkoutTemplateController,
    DeleteWorkoutTemplateController,
    AddExerciseTemplateController,
    ReorderExerciseTemplatesController,
  ],
  providers: [
    WorkoutTemplatesRepository,
    ExerciseTemplatesRepository,
    ExercisesRepository,
    UpdateWorkoutTemplateUseCase,
    DeleteWorkoutTemplateUseCase,
    AddExerciseTemplateUseCase,
    ReorderExerciseTemplatesUseCase,
  ],
  exports: [WorkoutTemplatesRepository, ExerciseTemplatesRepository],
})
export class WorkoutTemplatesModule {}
