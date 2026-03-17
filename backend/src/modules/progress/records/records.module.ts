import { Module } from "@nestjs/common";

import { ProgressRecordsRepository } from "@shared/repositories/progressRecords.repository";
import { StudentsRepository } from "@shared/repositories/students.repository";

import { CreateProgressRecordController } from "./contexts/createRecord/createRecord.controller";
import { CreateProgressRecordUseCase } from "./contexts/createRecord/createRecord.useCase";
import { ListProgressRecordsController } from "./contexts/listRecords/listRecords.controller";
import { ListProgressRecordsUseCase } from "./contexts/listRecords/listRecords.useCase";
import { UpdateProgressRecordController } from "./contexts/updateRecord/updateRecord.controller";
import { UpdateProgressRecordUseCase } from "./contexts/updateRecord/updateRecord.useCase";
import { DeleteProgressRecordController } from "./contexts/deleteRecord/deleteRecord.controller";
import { DeleteProgressRecordUseCase } from "./contexts/deleteRecord/deleteRecord.useCase";

@Module({
  controllers: [
    CreateProgressRecordController,
    ListProgressRecordsController,
    UpdateProgressRecordController,
    DeleteProgressRecordController,
  ],
  providers: [
    ProgressRecordsRepository,
    StudentsRepository,
    CreateProgressRecordUseCase,
    ListProgressRecordsUseCase,
    UpdateProgressRecordUseCase,
    DeleteProgressRecordUseCase,
  ],
  exports: [ProgressRecordsRepository],
})
export class ProgressRecordsModule {}
