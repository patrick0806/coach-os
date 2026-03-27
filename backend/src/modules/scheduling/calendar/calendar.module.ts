import { Module } from "@nestjs/common";

import { WorkingHoursRepository } from "@shared/repositories/workingHours.repository";
import { RecurringSlotsRepository } from "@shared/repositories/recurringSlots.repository";
import { CalendarEventsRepository } from "@shared/repositories/calendarEvents.repository";
import { StudentsRepository } from "@shared/repositories/students.repository";

import { GetCalendarController } from "./contexts/getCalendar/getCalendar.controller";
import { GetCalendarUseCase } from "./contexts/getCalendar/getCalendar.useCase";
import { GetAvailabilityController } from "./contexts/getAvailability/getAvailability.controller";
import { GetAvailabilityUseCase } from "./contexts/getAvailability/getAvailability.useCase";
import { GetMyCalendarController } from "./contexts/getMyCalendar/getMyCalendar.controller";
import { GetMyCalendarUseCase } from "./contexts/getMyCalendar/getMyCalendar.useCase";

@Module({
  controllers: [GetCalendarController, GetAvailabilityController, GetMyCalendarController],
  providers: [
    GetCalendarUseCase,
    GetAvailabilityUseCase,
    GetMyCalendarUseCase,
    WorkingHoursRepository,
    RecurringSlotsRepository,
    CalendarEventsRepository,
    StudentsRepository,
  ],
})
export class CalendarModule {}
