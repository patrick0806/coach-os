import { Module } from "@nestjs/common";

import { PersonalsRepository } from "@shared/repositories/personals.repository";
import { UsersRepository } from "@shared/repositories/users.repository";
import { S3Provider } from "@shared/providers/s3.provider";
import { StripeProvider } from "@shared/providers/stripe.provider";

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
import { DeleteAccountController } from "./contexts/deleteAccount/deleteAccount.controller";
import { DeleteAccountUseCase } from "./contexts/deleteAccount/deleteAccount.useCase";

@Module({
  controllers: [
    GetProfileController,
    UpdateProfileController,
    RequestPhotoUploadController,
    SaveLpDraftController,
    PublishLpDraftController,
    GetTourProgressController,
    MarkPageTouredController,
    DeleteAccountController,
  ],
  providers: [
    PersonalsRepository,
    UsersRepository,
    S3Provider,
    StripeProvider,
    GetProfileUseCase,
    UpdateProfileUseCase,
    RequestPhotoUploadUseCase,
    SaveLpDraftUseCase,
    PublishLpDraftUseCase,
    GetTourProgressUseCase,
    MarkPageTouredUseCase,
    DeleteAccountUseCase,
  ],
})
export class ProfileModule {}
