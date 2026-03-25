import { Module } from "@nestjs/common";

import { WorkingHoursModule } from "./workingHours/workingHours.module";
import { RecurringSlotsModule } from "./recurringSlots/recurringSlots.module";
import { CalendarEventsModule } from "./calendarEvents/calendarEvents.module";
import { CalendarModule } from "./calendar/calendar.module";

@Module({
  imports: [
    WorkingHoursModule,
    RecurringSlotsModule,
    CalendarEventsModule,
    CalendarModule,
  ],
  exports: [RecurringSlotsModule],
})
export class SchedulingModule {}
