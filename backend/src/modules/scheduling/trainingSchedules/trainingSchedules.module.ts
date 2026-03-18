import { Module } from "@nestjs/common";

import { TrainingSchedulesRepository } from "@shared/repositories/trainingSchedules.repository";
import { StudentsRepository } from "@shared/repositories/students.repository";
import { StudentProgramsRepository } from "@shared/repositories/studentPrograms.repository";

import { CreateTrainingScheduleController } from "./contexts/createSchedule/createSchedule.controller";
import { CreateTrainingScheduleUseCase } from "./contexts/createSchedule/createSchedule.useCase";
import { ListTrainingSchedulesController } from "./contexts/listSchedules/listSchedules.controller";
import { ListTrainingSchedulesUseCase } from "./contexts/listSchedules/listSchedules.useCase";
import { UpdateTrainingScheduleController } from "./contexts/updateSchedule/updateSchedule.controller";
import { UpdateTrainingScheduleUseCase } from "./contexts/updateSchedule/updateSchedule.useCase";
import { DeleteTrainingScheduleController } from "./contexts/deleteSchedule/deleteSchedule.controller";
import { DeleteTrainingScheduleUseCase } from "./contexts/deleteSchedule/deleteSchedule.useCase";
import { DeactivateByProgramUseCase } from "./contexts/deactivateByProgram/deactivateByProgram.useCase";
import { ListMySchedulesController } from "./contexts/listMySchedules/listMySchedulesController";
import { ListMySchedulesUseCase } from "./contexts/listMySchedules/listMySchedulesUseCase";

@Module({
  controllers: [
    CreateTrainingScheduleController,
    ListTrainingSchedulesController,
    UpdateTrainingScheduleController,
    DeleteTrainingScheduleController,
    ListMySchedulesController,
  ],
  providers: [
    TrainingSchedulesRepository,
    StudentsRepository,
    StudentProgramsRepository,
    CreateTrainingScheduleUseCase,
    ListTrainingSchedulesUseCase,
    UpdateTrainingScheduleUseCase,
    DeleteTrainingScheduleUseCase,
    DeactivateByProgramUseCase,
    ListMySchedulesUseCase,
  ],
  exports: [TrainingSchedulesRepository, DeactivateByProgramUseCase],
})
export class TrainingSchedulesModule {}
