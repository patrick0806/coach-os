import { Module } from "@nestjs/common";

import { PersonalsRepository } from "@shared/repositories/personals.repository";
import { S3Provider } from "@shared/providers/s3.provider";

import { GetProfileController } from "./contexts/getProfile/getProfile.controller";
import { GetProfileUseCase } from "./contexts/getProfile/getProfile.useCase";
import { UpdateProfileController } from "./contexts/updateProfile/updateProfile.controller";
import { UpdateProfileUseCase } from "./contexts/updateProfile/updateProfile.useCase";
import { RequestPhotoUploadController } from "./contexts/requestPhotoUpload/requestPhotoUpload.controller";
import { RequestPhotoUploadUseCase } from "./contexts/requestPhotoUpload/requestPhotoUpload.useCase";

@Module({
  controllers: [
    GetProfileController,
    UpdateProfileController,
    RequestPhotoUploadController,
  ],
  providers: [
    PersonalsRepository,
    S3Provider,
    GetProfileUseCase,
    UpdateProfileUseCase,
    RequestPhotoUploadUseCase,
  ],
})
export class ProfileModule {}
