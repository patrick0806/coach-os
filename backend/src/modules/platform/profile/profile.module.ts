import { Module } from "@nestjs/common";

import { PersonalsRepository } from "@shared/repositories/personals.repository";
import { S3Provider } from "@shared/providers/s3.provider";

import { GetProfileController } from "./contexts/getProfile/getProfile.controller";
import { GetProfileUseCase } from "./contexts/getProfile/getProfile.useCase";
import { UpdateProfileController } from "./contexts/updateProfile/updateProfile.controller";
import { UpdateProfileUseCase } from "./contexts/updateProfile/updateProfile.useCase";
import { RequestPhotoUploadController } from "./contexts/requestPhotoUpload/requestPhotoUpload.controller";
import { RequestPhotoUploadUseCase } from "./contexts/requestPhotoUpload/requestPhotoUpload.useCase";
import { SaveLpDraftController } from "./contexts/saveLpDraft/saveLpDraft.controller";
import { SaveLpDraftUseCase } from "./contexts/saveLpDraft/saveLpDraft.useCase";
import { PublishLpDraftController } from "./contexts/publishLpDraft/publishLpDraft.controller";
import { PublishLpDraftUseCase } from "./contexts/publishLpDraft/publishLpDraft.useCase";
import { GetTourProgressController } from "./contexts/getTourProgress/getTourProgress.controller";
import { GetTourProgressUseCase } from "./contexts/getTourProgress/getTourProgress.useCase";
import { MarkPageTouredController } from "./contexts/markPageToured/markPageToured.controller";
import { MarkPageTouredUseCase } from "./contexts/markPageToured/markPageToured.useCase";

@Module({
  controllers: [
    GetProfileController,
    UpdateProfileController,
    RequestPhotoUploadController,
    SaveLpDraftController,
    PublishLpDraftController,
    GetTourProgressController,
    MarkPageTouredController,
  ],
  providers: [
    PersonalsRepository,
    S3Provider,
    GetProfileUseCase,
    UpdateProfileUseCase,
    RequestPhotoUploadUseCase,
    SaveLpDraftUseCase,
    PublishLpDraftUseCase,
    GetTourProgressUseCase,
    MarkPageTouredUseCase,
  ],
})
export class ProfileModule {}
