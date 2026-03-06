import { Module } from "@nestjs/common";

import { AvailabilityRepository } from "@shared/repositories/availability.repository";

import { ListAvailabilityController } from "./availability/list/list-availability.controller";
import { ListAvailabilityService } from "./availability/list/list-availability.service";
import { CreateAvailabilityController } from "./availability/create/create-availability.controller";
import { CreateAvailabilityService } from "./availability/create/create-availability.service";
import { UpdateAvailabilityController } from "./availability/update/update-availability.controller";
import { UpdateAvailabilityService } from "./availability/update/update-availability.service";
import { DeleteAvailabilityController } from "./availability/delete/delete-availability.controller";
import { DeleteAvailabilityService } from "./availability/delete/delete-availability.service";

@Module({
  controllers: [
    ListAvailabilityController,
    CreateAvailabilityController,
    UpdateAvailabilityController,
    DeleteAvailabilityController,
  ],
  providers: [
    ListAvailabilityService,
    CreateAvailabilityService,
    UpdateAvailabilityService,
    DeleteAvailabilityService,
    AvailabilityRepository,
  ],
})
export class SchedulingModule {}
