import { Module } from "@nestjs/common";

import { WorkingHoursRepository } from "@shared/repositories/workingHours.repository";
import { RecurringSlotsRepository } from "@shared/repositories/recurringSlots.repository";
import { CalendarEventsRepository } from "@shared/repositories/calendarEvents.repository";
import { StudentsRepository } from "@shared/repositories/students.repository";

import { GetCalendarController } from "./contexts/getCalendar/getCalendar.controller";
import { GetCalendarUseCase } from "./contexts/getCalendar/getCalendar.useCase";
import { GetAvailabilityController } from "./contexts/getAvailability/getAvailability.controller";
import { GetAvailabilityUseCase } from "./contexts/getAvailability/getAvailability.useCase";

@Module({
  controllers: [GetCalendarController, GetAvailabilityController],
  providers: [
    GetCalendarUseCase,
    GetAvailabilityUseCase,
    WorkingHoursRepository,
    RecurringSlotsRepository,
    CalendarEventsRepository,
    StudentsRepository,
  ],
})
export class CalendarModule {}
