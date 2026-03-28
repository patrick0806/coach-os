import { Module } from "@nestjs/common";

import { WorkoutDaysRepository } from "@shared/repositories/workoutDays.repository";
import { StudentExercisesRepository } from "@shared/repositories/studentExercises.repository";
import { ExercisesRepository } from "@shared/repositories/exercises.repository";

import { UpdateWorkoutDayController } from "./contexts/updateWorkoutDay/updateWorkoutDay.controller";
import { UpdateWorkoutDayUseCase } from "./contexts/updateWorkoutDay/updateWorkoutDay.useCase";
import { DeleteWorkoutDayController } from "./contexts/deleteWorkoutDay/deleteWorkoutDay.controller";
import { DeleteWorkoutDayUseCase } from "./contexts/deleteWorkoutDay/deleteWorkoutDay.useCase";
import { AddStudentExerciseController } from "./contexts/addStudentExercise/addStudentExercise.controller";
import { AddStudentExerciseUseCase } from "./contexts/addStudentExercise/addStudentExercise.useCase";
import { ReorderStudentExercisesController } from "./contexts/reorderStudentExercises/reorderStudentExercises.controller";
import { ReorderStudentExercisesUseCase } from "./contexts/reorderStudentExercises/reorderStudentExercises.useCase";

@Module({
  controllers: [
    UpdateWorkoutDayController,
    DeleteWorkoutDayController,
    AddStudentExerciseController,
    ReorderStudentExercisesController,
  ],
  providers: [
    WorkoutDaysRepository,
    StudentExercisesRepository,
    ExercisesRepository,
    UpdateWorkoutDayUseCase,
    DeleteWorkoutDayUseCase,
    AddStudentExerciseUseCase,
    ReorderStudentExercisesUseCase,
  ],
})
export class WorkoutDaysModule {}
