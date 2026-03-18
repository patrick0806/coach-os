import { Module } from "@nestjs/common";

import { ListMuscleGroupsController } from "./contexts/listMuscleGroups/listMuscleGroups.controller";
import { ListMuscleGroupsUseCase } from "./contexts/listMuscleGroups/listMuscleGroups.useCase";
import { ListAttendanceTypesController } from "./contexts/listAttendanceTypes/listAttendanceTypes.controller";
import { ListAttendanceTypesUseCase } from "./contexts/listAttendanceTypes/listAttendanceTypes.useCase";

@Module({
  controllers: [
    ListMuscleGroupsController,
    ListAttendanceTypesController,
  ],
  providers: [
    ListMuscleGroupsUseCase,
    ListAttendanceTypesUseCase,
  ],
})
export class EnumsModule {}
