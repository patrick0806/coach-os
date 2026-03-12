import { Module } from "@nestjs/common";

import { UsersRepository } from "@shared/repositories/users.repository";
import { PersonalsRepository } from "@shared/repositories/personals.repository";
import { ServicePlansRepository } from "@shared/repositories/service-plans.repository";
import { AvailabilityRepository } from "@shared/repositories/availability.repository";
import { ScheduleRulesRepository } from "@shared/repositories/schedule-rules.repository";
import { TrainingSessionsRepository } from "@shared/repositories/training-sessions.repository";
import { S3Provider } from "@shared/providers/s3.provider";

import { GetProfileController } from "./contexts/profile/get-profile/get-profile.controller";
import { GetProfileService } from "./contexts/profile/get-profile/get-profile.service";
import { UpdateProfileController } from "./contexts/profile/update-profile/update-profile.controller";
import { UpdateProfileService } from "./contexts/profile/update-profile/update-profile.service";
import { UploadImageController } from "./contexts/profile/upload-image/upload-image.controller";
import { UploadImageService } from "./contexts/profile/upload-image/upload-image.service";
import { GetPublicProfileController } from "./contexts/public-profile/get-public-profile/get-public-profile.controller";
import { GetPublicProfileService } from "./contexts/public-profile/get-public-profile/get-public-profile.service";
import { GetAvailableSlotsController } from "./contexts/public-profile/get-available-slots/get-available-slots.controller";
import { GetAvailableSlotsService } from "./contexts/public-profile/get-available-slots/get-available-slots.service";
import { GetWeeklyAvailabilityController } from "./contexts/public-profile/get-weekly-availability/get-weekly-availability.controller";
import { GetWeeklyAvailabilityService } from "./contexts/public-profile/get-weekly-availability/get-weekly-availability.service";

@Module({
  controllers: [
    GetProfileController,
    UpdateProfileController,
    UploadImageController,
    GetPublicProfileController,
    GetAvailableSlotsController,
    GetWeeklyAvailabilityController,
  ],
  providers: [
    GetProfileService,
    UpdateProfileService,
    UploadImageService,
    GetPublicProfileService,
    GetAvailableSlotsService,
    GetWeeklyAvailabilityService,
    UsersRepository,
    PersonalsRepository,
    ServicePlansRepository,
    AvailabilityRepository,
    ScheduleRulesRepository,
    TrainingSessionsRepository,
    S3Provider,
  ],
})
export class PersonalsModule { }
