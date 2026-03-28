import { Module } from "@nestjs/common";

import { DrizzleProvider } from "@shared/providers/drizzle.service";
import { StudentsRepository } from "@shared/repositories/students.repository";
import { ProgramTemplatesRepository } from "@shared/repositories/programTemplates.repository";
import { StudentProgramsRepository } from "@shared/repositories/studentPrograms.repository";
import { WorkoutDaysRepository } from "@shared/repositories/workoutDays.repository";
import { StudentExercisesRepository } from "@shared/repositories/studentExercises.repository";
import { RecurringSlotsRepository } from "@shared/repositories/recurringSlots.repository";

import { AssignProgramController } from "./contexts/assignProgram/assignProgram.controller";
import { AssignProgramUseCase } from "./contexts/assignProgram/assignProgram.useCase";
import { ListStudentProgramsController } from "./contexts/listStudentPrograms/listStudentPrograms.controller";
import { ListStudentProgramsUseCase } from "./contexts/listStudentPrograms/listStudentPrograms.useCase";
import { GetMyProgramsController } from "./contexts/getMyPrograms/getMyPrograms.controller";
import { GetMyProgramsUseCase } from "./contexts/getMyPrograms/getMyPrograms.useCase";
import { GetStudentProgramController } from "./contexts/getStudentProgram/getStudentProgram.controller";
import { GetStudentProgramUseCase } from "./contexts/getStudentProgram/getStudentProgram.useCase";
import { UpdateStudentProgramStatusController } from "./contexts/updateStudentProgramStatus/updateStudentProgramStatus.controller";
import { UpdateStudentProgramStatusUseCase } from "./contexts/updateStudentProgramStatus/updateStudentProgramStatus.useCase";
import { AddWorkoutDayController } from "./contexts/addWorkoutDay/addWorkoutDay.controller";
import { AddWorkoutDayUseCase } from "./contexts/addWorkoutDay/addWorkoutDay.useCase";
import { ReorderWorkoutDaysController } from "./contexts/reorderWorkoutDays/reorderWorkoutDays.controller";
import { ReorderWorkoutDaysUseCase } from "./contexts/reorderWorkoutDays/reorderWorkoutDays.useCase";

@Module({
  controllers: [
    AssignProgramController,
    ListStudentProgramsController,
    GetMyProgramsController,
    GetStudentProgramController,
    UpdateStudentProgramStatusController,
    AddWorkoutDayController,
    ReorderWorkoutDaysController,
  ],
  providers: [
    DrizzleProvider,
    StudentsRepository,
    ProgramTemplatesRepository,
    StudentProgramsRepository,
    WorkoutDaysRepository,
    StudentExercisesRepository,
    RecurringSlotsRepository,
    AssignProgramUseCase,
    ListStudentProgramsUseCase,
    GetMyProgramsUseCase,
    GetStudentProgramUseCase,
    UpdateStudentProgramStatusUseCase,
    AddWorkoutDayUseCase,
    ReorderWorkoutDaysUseCase,
  ],
  exports: [StudentProgramsRepository, WorkoutDaysRepository, StudentExercisesRepository],
})
export class StudentProgramsModule {}
