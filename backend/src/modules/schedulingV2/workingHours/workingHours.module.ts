import { Module } from "@nestjs/common";

import { WorkingHoursRepository } from "@shared/repositories/workingHours.repository";

import { CreateWorkingHoursController } from "./contexts/createWorkingHours/createWorkingHours.controller";
import { CreateWorkingHoursUseCase } from "./contexts/createWorkingHours/createWorkingHours.useCase";
import { ListWorkingHoursController } from "./contexts/listWorkingHours/listWorkingHours.controller";
import { ListWorkingHoursUseCase } from "./contexts/listWorkingHours/listWorkingHours.useCase";
import { UpdateWorkingHoursController } from "./contexts/updateWorkingHours/updateWorkingHours.controller";
import { UpdateWorkingHoursUseCase } from "./contexts/updateWorkingHours/updateWorkingHours.useCase";
import { DeleteWorkingHoursController } from "./contexts/deleteWorkingHours/deleteWorkingHours.controller";
import { DeleteWorkingHoursUseCase } from "./contexts/deleteWorkingHours/deleteWorkingHours.useCase";

@Module({
  controllers: [
    CreateWorkingHoursController,
    ListWorkingHoursController,
    UpdateWorkingHoursController,
    DeleteWorkingHoursController,
  ],
  providers: [
    WorkingHoursRepository,
    CreateWorkingHoursUseCase,
    ListWorkingHoursUseCase,
    UpdateWorkingHoursUseCase,
    DeleteWorkingHoursUseCase,
  ],
  exports: [WorkingHoursRepository],
})
export class WorkingHoursModule {}
