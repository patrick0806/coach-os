import { Module } from "@nestjs/common";

import { CoachingContractsRepository } from "@shared/repositories/coachingContracts.repository";
import { StudentsRepository } from "@shared/repositories/students.repository";
import { ServicePlansRepository } from "@shared/repositories/servicePlans.repository";

import { CreateContractController } from "./contexts/createContract/createContract.controller";
import { CreateContractUseCase } from "./contexts/createContract/createContract.useCase";
import { ListContractsController } from "./contexts/listContracts/listContracts.controller";
import { ListContractsUseCase } from "./contexts/listContracts/listContracts.useCase";
import { CancelContractController } from "./contexts/cancelContract/cancelContract.controller";
import { CancelContractUseCase } from "./contexts/cancelContract/cancelContract.useCase";

@Module({
  controllers: [
    CreateContractController,
    ListContractsController,
    CancelContractController,
  ],
  providers: [
    CoachingContractsRepository,
    StudentsRepository,
    ServicePlansRepository,
    CreateContractUseCase,
    ListContractsUseCase,
    CancelContractUseCase,
  ],
})
export class CoachingContractsModule {}
