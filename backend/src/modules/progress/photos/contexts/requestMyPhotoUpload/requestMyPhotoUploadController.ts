import { Body, Controller, HttpCode, HttpStatus, Post } from "@nestjs/common";
import {
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from "@nestjs/swagger";

import { API_TAGS } from "@shared/constants";
import { CurrentUser, Roles } from "@shared/decorators";
import { ApplicationRoles } from "@shared/enums";
import { IAccessToken } from "@shared/interfaces/accessToken.interface";

import { RequestPhotoUploadUseCase } from "../requestPhotoUpload/requestPhotoUpload.useCase";

@ApiTags(API_TAGS.STUDENTS)
@Roles(ApplicationRoles.STUDENT)
@Controller({ version: "1", path: "me/progress-photos" })
export class RequestMyPhotoUploadController {
  constructor(
    private readonly requestPhotoUploadUseCase: RequestPhotoUploadUseCase,
  ) {}

  @ApiOperation({ summary: "Request presigned URL to upload my own progress photo (student)" })
  @ApiOkResponse({ description: "Presigned URL generated" })
  @HttpCode(HttpStatus.OK)
  @Post("upload-url")
  async handle(
    @Body() body: unknown,
    @CurrentUser() user: IAccessToken,
  ) {
    return this.requestPhotoUploadUseCase.execute(
      user.profileId,
      body,
      user.personalId!,
    );
  }
}
