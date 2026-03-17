import { Module } from "@nestjs/common";

import { StudentExercisesRepository } from "@shared/repositories/studentExercises.repository";

import { UpdateStudentExerciseController } from "./contexts/updateStudentExercise/updateStudentExercise.controller";
import { UpdateStudentExerciseUseCase } from "./contexts/updateStudentExercise/updateStudentExercise.useCase";

@Module({
  controllers: [UpdateStudentExerciseController],
  providers: [StudentExercisesRepository, UpdateStudentExerciseUseCase],
})
export class StudentExercisesModule {}
