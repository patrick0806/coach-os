import { Module } from "@nestjs/common";

import { S3Provider } from "@shared/providers/s3.provider";
import { ProgressPhotosRepository } from "@shared/repositories/progressPhotos.repository";
import { StudentsRepository } from "@shared/repositories/students.repository";

import { RequestPhotoUploadController } from "./contexts/requestPhotoUpload/requestPhotoUpload.controller";
import { RequestPhotoUploadUseCase } from "./contexts/requestPhotoUpload/requestPhotoUpload.useCase";
import { SaveProgressPhotoController } from "./contexts/savePhoto/savePhoto.controller";
import { SaveProgressPhotoUseCase } from "./contexts/savePhoto/savePhoto.useCase";
import { ListProgressPhotosController } from "./contexts/listPhotos/listPhotos.controller";
import { ListProgressPhotosUseCase } from "./contexts/listPhotos/listPhotos.useCase";
import { DeleteProgressPhotoController } from "./contexts/deletePhoto/deleteProgressPhoto.controller";
import { DeleteProgressPhotoUseCase } from "./contexts/deletePhoto/deleteProgressPhoto.useCase";

@Module({
  controllers: [
    RequestPhotoUploadController,
    SaveProgressPhotoController,
    ListProgressPhotosController,
    DeleteProgressPhotoController,
  ],
  providers: [
    S3Provider,
    ProgressPhotosRepository,
    StudentsRepository,
    RequestPhotoUploadUseCase,
    SaveProgressPhotoUseCase,
    ListProgressPhotosUseCase,
    DeleteProgressPhotoUseCase,
  ],
  exports: [ProgressPhotosRepository],
})
export class ProgressPhotosModule {}
