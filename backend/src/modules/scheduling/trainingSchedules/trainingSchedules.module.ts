import { Module } from "@nestjs/common";

import { TrainingSchedulesRepository } from "@shared/repositories/trainingSchedules.repository";
import { TrainingScheduleExceptionsRepository } from "@shared/repositories/trainingScheduleExceptions.repository";
import { StudentsRepository } from "@shared/repositories/students.repository";
import { StudentProgramsRepository } from "@shared/repositories/studentPrograms.repository";
import { AvailabilityRulesRepository } from "@shared/repositories/availabilityRules.repository";
import { AvailabilityExceptionsRepository } from "@shared/repositories/availabilityExceptions.repository";
import { AppointmentsRepository } from "@shared/repositories/appointments.repository";

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
import { RescheduleOccurrenceController } from "./contexts/rescheduleOccurrence/rescheduleOccurrence.controller";
import { RescheduleOccurrenceUseCase } from "./contexts/rescheduleOccurrence/rescheduleOccurrence.useCase";
import { SkipOccurrenceController } from "./contexts/skipOccurrence/skipOccurrence.controller";
import { SkipOccurrenceUseCase } from "./contexts/skipOccurrence/skipOccurrence.useCase";
import { DeleteExceptionController } from "./contexts/deleteException/deleteException.controller";
import { DeleteExceptionUseCase } from "./contexts/deleteException/deleteException.useCase";

@Module({
  controllers: [
    CreateTrainingScheduleController,
    ListTrainingSchedulesController,
    UpdateTrainingScheduleController,
    DeleteTrainingScheduleController,
    ListMySchedulesController,
    RescheduleOccurrenceController,
    SkipOccurrenceController,
    DeleteExceptionController,
  ],
  providers: [
    TrainingSchedulesRepository,
    TrainingScheduleExceptionsRepository,
    StudentsRepository,
    StudentProgramsRepository,
    AvailabilityRulesRepository,
    AvailabilityExceptionsRepository,
    AppointmentsRepository,
    CreateTrainingScheduleUseCase,
    ListTrainingSchedulesUseCase,
    UpdateTrainingScheduleUseCase,
    DeleteTrainingScheduleUseCase,
    DeactivateByProgramUseCase,
    ListMySchedulesUseCase,
    RescheduleOccurrenceUseCase,
    SkipOccurrenceUseCase,
    DeleteExceptionUseCase,
  ],
  exports: [TrainingSchedulesRepository, TrainingScheduleExceptionsRepository, DeactivateByProgramUseCase],
})
export class TrainingSchedulesModule {}
