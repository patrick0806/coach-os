import { Module } from "@nestjs/common";

import { UsersRepository } from "@shared/repositories/users.repository";
import { PersonalsRepository } from "@shared/repositories/personals.repository";
import { ServicePlansRepository } from "@shared/repositories/service-plans.repository";
import { S3Provider } from "@shared/providers/s3.provider";

import { GetProfileController } from "./contexts/profile/get-profile/get-profile.controller";
import { GetProfileService } from "./contexts/profile/get-profile/get-profile.service";
import { UpdateProfileController } from "./contexts/profile/update-profile/update-profile.controller";
import { UpdateProfileService } from "./contexts/profile/update-profile/update-profile.service";
import { UploadImageController } from "./contexts/profile/upload-image/upload-image.controller";
import { UploadImageService } from "./contexts/profile/upload-image/upload-image.service";
import { GetPublicProfileController } from "./contexts/public-profile/get-public-profile/get-public-profile.controller";
import { GetPublicProfileService } from "./contexts/public-profile/get-public-profile/get-public-profile.service";

@Module({
  controllers: [
    GetProfileController,
    UpdateProfileController,
    UploadImageController,
    GetPublicProfileController,
  ],
  providers: [
    GetProfileService,
    UpdateProfileService,
    UploadImageService,
    GetPublicProfileService,
    UsersRepository,
    PersonalsRepository,
    ServicePlansRepository,
    S3Provider,
  ],
})
export class PersonalsModule {}
