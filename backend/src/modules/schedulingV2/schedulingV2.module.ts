import { Module } from "@nestjs/common";

import { WorkingHoursModule } from "./workingHours/workingHours.module";
import { RecurringSlotsModule } from "./recurringSlots/recurringSlots.module";
import { CalendarEventsModule } from "./calendarEvents/calendarEvents.module";
import { CalendarV2Module } from "./calendar/calendarV2.module";

@Module({
  imports: [
    WorkingHoursModule,
    RecurringSlotsModule,
    CalendarEventsModule,
    CalendarV2Module,
  ],
  exports: [RecurringSlotsModule],
})
export class SchedulingV2Module {}
