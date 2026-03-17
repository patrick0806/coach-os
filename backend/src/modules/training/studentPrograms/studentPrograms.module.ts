import { Module } from "@nestjs/common";

import { DrizzleProvider } from "@shared/providers/drizzle.service";
import { StudentsRepository } from "@shared/repositories/students.repository";
import { ProgramTemplatesRepository } from "@shared/repositories/programTemplates.repository";
import { StudentProgramsRepository } from "@shared/repositories/studentPrograms.repository";
import { WorkoutDaysRepository } from "@shared/repositories/workoutDays.repository";
import { StudentExercisesRepository } from "@shared/repositories/studentExercises.repository";
import { TrainingSchedulesRepository } from "@shared/repositories/trainingSchedules.repository";

import { AssignProgramController } from "./contexts/assignProgram/assignProgram.controller";
import { AssignProgramUseCase } from "./contexts/assignProgram/assignProgram.useCase";
import { ListStudentProgramsController } from "./contexts/listStudentPrograms/listStudentPrograms.controller";
import { ListStudentProgramsUseCase } from "./contexts/listStudentPrograms/listStudentPrograms.useCase";
import { GetStudentProgramController } from "./contexts/getStudentProgram/getStudentProgram.controller";
import { GetStudentProgramUseCase } from "./contexts/getStudentProgram/getStudentProgram.useCase";
import { UpdateStudentProgramStatusController } from "./contexts/updateStudentProgramStatus/updateStudentProgramStatus.controller";
import { UpdateStudentProgramStatusUseCase } from "./contexts/updateStudentProgramStatus/updateStudentProgramStatus.useCase";

@Module({
  controllers: [
    AssignProgramController,
    ListStudentProgramsController,
    GetStudentProgramController,
    UpdateStudentProgramStatusController,
  ],
  providers: [
    DrizzleProvider,
    StudentsRepository,
    ProgramTemplatesRepository,
    StudentProgramsRepository,
    WorkoutDaysRepository,
    StudentExercisesRepository,
    TrainingSchedulesRepository,
    AssignProgramUseCase,
    ListStudentProgramsUseCase,
    GetStudentProgramUseCase,
    UpdateStudentProgramStatusUseCase,
  ],
  exports: [StudentProgramsRepository, WorkoutDaysRepository, StudentExercisesRepository],
})
export class StudentProgramsModule {}
