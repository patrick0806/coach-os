import { Module } from "@nestjs/common";

import { ProgramTemplatesRepository } from "@shared/repositories/programTemplates.repository";
import { WorkoutTemplatesRepository } from "@shared/repositories/workoutTemplates.repository";
import { ExerciseTemplatesRepository } from "@shared/repositories/exerciseTemplates.repository";
import { DrizzleProvider } from "@shared/providers/drizzle.service";

import { CreateProgramTemplateController } from "./contexts/createProgramTemplate/createProgramTemplate.controller";
import { CreateProgramTemplateUseCase } from "./contexts/createProgramTemplate/createProgramTemplate.useCase";
import { ListProgramTemplatesController } from "./contexts/listProgramTemplates/listProgramTemplates.controller";
import { ListProgramTemplatesUseCase } from "./contexts/listProgramTemplates/listProgramTemplates.useCase";
import { GetProgramTemplateController } from "./contexts/getProgramTemplate/getProgramTemplate.controller";
import { GetProgramTemplateUseCase } from "./contexts/getProgramTemplate/getProgramTemplate.useCase";
import { UpdateProgramTemplateController } from "./contexts/updateProgramTemplate/updateProgramTemplate.controller";
import { UpdateProgramTemplateUseCase } from "./contexts/updateProgramTemplate/updateProgramTemplate.useCase";
import { DeleteProgramTemplateController } from "./contexts/deleteProgramTemplate/deleteProgramTemplate.controller";
import { DeleteProgramTemplateUseCase } from "./contexts/deleteProgramTemplate/deleteProgramTemplate.useCase";
import { DuplicateProgramTemplateController } from "./contexts/duplicateProgramTemplate/duplicateProgramTemplate.controller";
import { DuplicateProgramTemplateUseCase } from "./contexts/duplicateProgramTemplate/duplicateProgramTemplate.useCase";
import { AddWorkoutTemplateController } from "./contexts/addWorkoutTemplate/addWorkoutTemplate.controller";
import { AddWorkoutTemplateUseCase } from "./contexts/addWorkoutTemplate/addWorkoutTemplate.useCase";
import { ReorderWorkoutTemplatesController } from "./contexts/reorderWorkoutTemplates/reorderWorkoutTemplates.controller";
import { ReorderWorkoutTemplatesUseCase } from "./contexts/reorderWorkoutTemplates/reorderWorkoutTemplates.useCase";

@Module({
  controllers: [
    CreateProgramTemplateController,
    ListProgramTemplatesController,
    GetProgramTemplateController,
    UpdateProgramTemplateController,
    DeleteProgramTemplateController,
    DuplicateProgramTemplateController,
    AddWorkoutTemplateController,
    ReorderWorkoutTemplatesController,
  ],
  providers: [
    DrizzleProvider,
    ProgramTemplatesRepository,
    WorkoutTemplatesRepository,
    ExerciseTemplatesRepository,
    CreateProgramTemplateUseCase,
    ListProgramTemplatesUseCase,
    GetProgramTemplateUseCase,
    UpdateProgramTemplateUseCase,
    DeleteProgramTemplateUseCase,
    DuplicateProgramTemplateUseCase,
    AddWorkoutTemplateUseCase,
    ReorderWorkoutTemplatesUseCase,
  ],
  exports: [
    ProgramTemplatesRepository,
    WorkoutTemplatesRepository,
    ExerciseTemplatesRepository,
  ],
})
export class ProgramTemplatesModule {}
