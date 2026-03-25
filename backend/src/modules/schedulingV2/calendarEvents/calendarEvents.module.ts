import { Module } from "@nestjs/common";

import { CalendarEventsRepository } from "@shared/repositories/calendarEvents.repository";
import { RecurringSlotsRepository } from "@shared/repositories/recurringSlots.repository";
import { WorkingHoursRepository } from "@shared/repositories/workingHours.repository";

import { CreateEventController } from "./contexts/createEvent/createEvent.controller";
import { CreateEventUseCase } from "./contexts/createEvent/createEvent.useCase";
import { UpdateEventController } from "./contexts/updateEvent/updateEvent.controller";
import { UpdateEventUseCase } from "./contexts/updateEvent/updateEvent.useCase";
import { CancelEventController } from "./contexts/cancelEvent/cancelEvent.controller";
import { CancelEventUseCase } from "./contexts/cancelEvent/cancelEvent.useCase";
import { CompleteEventController } from "./contexts/completeEvent/completeEvent.controller";
import { CompleteEventUseCase } from "./contexts/completeEvent/completeEvent.useCase";
import { ListMyEventsController } from "./contexts/listMyEvents/listMyEvents.controller";
import { ListMyEventsUseCase } from "./contexts/listMyEvents/listMyEvents.useCase";

@Module({
  controllers: [
    CreateEventController,
    UpdateEventController,
    CancelEventController,
    CompleteEventController,
    ListMyEventsController,
  ],
  providers: [
    CalendarEventsRepository,
    RecurringSlotsRepository,
    WorkingHoursRepository,
    CreateEventUseCase,
    UpdateEventUseCase,
    CancelEventUseCase,
    CompleteEventUseCase,
    ListMyEventsUseCase,
  ],
  exports: [CalendarEventsRepository],
})
export class CalendarEventsModule {}
