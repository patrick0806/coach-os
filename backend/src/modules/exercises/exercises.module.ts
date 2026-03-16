import { Module } from "@nestjs/common";

import { S3Provider } from "@shared/providers/s3.provider";
import { ExercisesRepository } from "@shared/repositories/exercises.repository";

import { CreateExerciseController } from "./contexts/createExercise/createExercise.controller";
import { CreateExerciseUseCase } from "./contexts/createExercise/createExercise.useCase";
import { ListExercisesController } from "./contexts/listExercises/listExercises.controller";
import { ListExercisesUseCase } from "./contexts/listExercises/listExercises.useCase";
import { GetExerciseController } from "./contexts/getExercise/getExercise.controller";
import { GetExerciseUseCase } from "./contexts/getExercise/getExercise.useCase";
import { UpdateExerciseController } from "./contexts/updateExercise/updateExercise.controller";
import { UpdateExerciseUseCase } from "./contexts/updateExercise/updateExercise.useCase";
import { DeleteExerciseController } from "./contexts/deleteExercise/deleteExercise.controller";
import { DeleteExerciseUseCase } from "./contexts/deleteExercise/deleteExercise.useCase";
import { RequestUploadUrlController } from "./contexts/requestUploadUrl/requestUploadUrl.controller";
import { RequestUploadUrlUseCase } from "./contexts/requestUploadUrl/requestUploadUrl.useCase";

@Module({
  controllers: [
    CreateExerciseController,
    ListExercisesController,
    GetExerciseController,
    UpdateExerciseController,
    DeleteExerciseController,
    RequestUploadUrlController,
  ],
  providers: [
    ExercisesRepository,
    S3Provider,
    CreateExerciseUseCase,
    ListExercisesUseCase,
    GetExerciseUseCase,
    UpdateExerciseUseCase,
    DeleteExerciseUseCase,
    RequestUploadUrlUseCase,
  ],
  exports: [ExercisesRepository],
})
export class ExercisesModule {}
