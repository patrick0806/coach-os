import { Module } from "@nestjs/common";

import { AppointmentsRepository } from "@shared/repositories/appointments.repository";
import { AvailabilityExceptionsRepository } from "@shared/repositories/availabilityExceptions.repository";
import { TrainingSchedulesRepository } from "@shared/repositories/trainingSchedules.repository";
import { TrainingScheduleExceptionsRepository } from "@shared/repositories/trainingScheduleExceptions.repository";
import { StudentsRepository } from "@shared/repositories/students.repository";

import { GetCalendarController } from "./contexts/getCalendar/getCalendar.controller";
import { GetCalendarUseCase } from "./contexts/getCalendar/getCalendar.useCase";

@Module({
  controllers: [GetCalendarController],
  providers: [
    AppointmentsRepository,
    AvailabilityExceptionsRepository,
    TrainingSchedulesRepository,
    TrainingScheduleExceptionsRepository,
    StudentsRepository,
    GetCalendarUseCase,
  ],
})
export class CalendarModule {}
