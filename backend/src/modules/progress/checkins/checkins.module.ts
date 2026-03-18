import { Module } from "@nestjs/common";

import { ProgressCheckinsRepository } from "@shared/repositories/progressCheckins.repository";
import { StudentsRepository } from "@shared/repositories/students.repository";

import { CreateCheckinController } from "./contexts/createCheckin/createCheckin.controller";
import { CreateCheckinUseCase } from "./contexts/createCheckin/createCheckin.useCase";
import { ListCheckinsController } from "./contexts/listCheckins/listCheckins.controller";
import { ListCheckinsUseCase } from "./contexts/listCheckins/listCheckins.useCase";
import { GetCheckinController } from "./contexts/getCheckin/getCheckin.controller";
import { GetCheckinUseCase } from "./contexts/getCheckin/getCheckin.useCase";
import { DeleteCheckinController } from "./contexts/deleteCheckin/deleteCheckin.controller";
import { DeleteCheckinUseCase } from "./contexts/deleteCheckin/deleteCheckin.useCase";
import { ListMyCheckinsController } from "./contexts/listMyCheckins/listMyCheckinsController";
import { ListMyCheckinsUseCase } from "./contexts/listMyCheckins/listMyCheckinsUseCase";
import { CreateMyCheckinController } from "./contexts/createMyCheckin/createMyCheckinController";

@Module({
  controllers: [
    CreateCheckinController,
    ListCheckinsController,
    GetCheckinController,
    DeleteCheckinController,
    ListMyCheckinsController,
    CreateMyCheckinController,
  ],
  providers: [
    ProgressCheckinsRepository,
    StudentsRepository,
    CreateCheckinUseCase,
    ListCheckinsUseCase,
    GetCheckinUseCase,
    DeleteCheckinUseCase,
    ListMyCheckinsUseCase,
  ],
})
export class ProgressCheckinsModule {}
