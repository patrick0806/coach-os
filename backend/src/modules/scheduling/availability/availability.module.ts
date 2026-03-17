import { Module } from "@nestjs/common";

import { AvailabilityRulesRepository } from "@shared/repositories/availabilityRules.repository";
import { AvailabilityExceptionsRepository } from "@shared/repositories/availabilityExceptions.repository";

import { CreateAvailabilityRuleController } from "./contexts/createRule/createRule.controller";
import { CreateAvailabilityRuleUseCase } from "./contexts/createRule/createRule.useCase";
import { ListAvailabilityRulesController } from "./contexts/listRules/listRules.controller";
import { ListAvailabilityRulesUseCase } from "./contexts/listRules/listRules.useCase";
import { UpdateAvailabilityRuleController } from "./contexts/updateRule/updateRule.controller";
import { UpdateAvailabilityRuleUseCase } from "./contexts/updateRule/updateRule.useCase";
import { DeleteAvailabilityRuleController } from "./contexts/deleteRule/deleteRule.controller";
import { DeleteAvailabilityRuleUseCase } from "./contexts/deleteRule/deleteRule.useCase";
import { CreateAvailabilityExceptionController } from "./contexts/createException/createException.controller";
import { CreateAvailabilityExceptionUseCase } from "./contexts/createException/createException.useCase";
import { ListAvailabilityExceptionsController } from "./contexts/listExceptions/listExceptions.controller";
import { ListAvailabilityExceptionsUseCase } from "./contexts/listExceptions/listExceptions.useCase";
import { DeleteAvailabilityExceptionController } from "./contexts/deleteException/deleteException.controller";
import { DeleteAvailabilityExceptionUseCase } from "./contexts/deleteException/deleteException.useCase";

@Module({
  controllers: [
    CreateAvailabilityRuleController,
    ListAvailabilityRulesController,
    UpdateAvailabilityRuleController,
    DeleteAvailabilityRuleController,
    CreateAvailabilityExceptionController,
    ListAvailabilityExceptionsController,
    DeleteAvailabilityExceptionController,
  ],
  providers: [
    AvailabilityRulesRepository,
    AvailabilityExceptionsRepository,
    CreateAvailabilityRuleUseCase,
    ListAvailabilityRulesUseCase,
    UpdateAvailabilityRuleUseCase,
    DeleteAvailabilityRuleUseCase,
    CreateAvailabilityExceptionUseCase,
    ListAvailabilityExceptionsUseCase,
    DeleteAvailabilityExceptionUseCase,
  ],
  exports: [AvailabilityRulesRepository, AvailabilityExceptionsRepository],
})
export class AvailabilityModule {}
