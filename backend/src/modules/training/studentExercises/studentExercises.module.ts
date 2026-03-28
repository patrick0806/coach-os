import { Module } from "@nestjs/common";

import { StudentExercisesRepository } from "@shared/repositories/studentExercises.repository";

import { UpdateStudentExerciseController } from "./contexts/updateStudentExercise/updateStudentExercise.controller";
import { UpdateStudentExerciseUseCase } from "./contexts/updateStudentExercise/updateStudentExercise.useCase";
import { DeleteStudentExerciseController } from "./contexts/deleteStudentExercise/deleteStudentExercise.controller";
import { DeleteStudentExerciseUseCase } from "./contexts/deleteStudentExercise/deleteStudentExercise.useCase";

@Module({
  controllers: [
    UpdateStudentExerciseController,
    DeleteStudentExerciseController,
  ],
  providers: [
    StudentExercisesRepository,
    UpdateStudentExerciseUseCase,
    DeleteStudentExerciseUseCase,
  ],
})
export class StudentExercisesModule {}
