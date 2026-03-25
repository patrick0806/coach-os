import { Module } from "@nestjs/common";

import { RecurringSlotsRepository } from "@shared/repositories/recurringSlots.repository";

import { CreateRecurringSlotController } from "./contexts/createRecurringSlot/createRecurringSlot.controller";
import { CreateRecurringSlotUseCase } from "./contexts/createRecurringSlot/createRecurringSlot.useCase";
import { ListRecurringSlotsController } from "./contexts/listRecurringSlots/listRecurringSlots.controller";
import { ListRecurringSlotsUseCase } from "./contexts/listRecurringSlots/listRecurringSlots.useCase";
import { UpdateRecurringSlotController } from "./contexts/updateRecurringSlot/updateRecurringSlot.controller";
import { UpdateRecurringSlotUseCase } from "./contexts/updateRecurringSlot/updateRecurringSlot.useCase";
import { DeleteRecurringSlotController } from "./contexts/deleteRecurringSlot/deleteRecurringSlot.controller";
import { DeleteRecurringSlotUseCase } from "./contexts/deleteRecurringSlot/deleteRecurringSlot.useCase";
import { DeactivateByProgramUseCase } from "./contexts/deactivateByProgram/deactivateByProgram.useCase";
import { ListMyRecurringSlotsController } from "./contexts/listMyRecurringSlots/listMyRecurringSlots.controller";
import { ListMyRecurringSlotsUseCase } from "./contexts/listMyRecurringSlots/listMyRecurringSlots.useCase";

@Module({
  controllers: [
    CreateRecurringSlotController,
    ListRecurringSlotsController,
    UpdateRecurringSlotController,
    DeleteRecurringSlotController,
    ListMyRecurringSlotsController,
  ],
  providers: [
    RecurringSlotsRepository,
    CreateRecurringSlotUseCase,
    ListRecurringSlotsUseCase,
    UpdateRecurringSlotUseCase,
    DeleteRecurringSlotUseCase,
    DeactivateByProgramUseCase,
    ListMyRecurringSlotsUseCase,
  ],
  exports: [RecurringSlotsRepository, DeactivateByProgramUseCase],
})
export class RecurringSlotsModule {}
