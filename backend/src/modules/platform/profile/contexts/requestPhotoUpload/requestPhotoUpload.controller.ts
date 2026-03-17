import { Body, Controller, HttpCode, HttpStatus, Post } from "@nestjs/common";
import { ApiCreatedResponse, ApiOperation, ApiTags } from "@nestjs/swagger";

import { API_TAGS } from "@shared/constants";
import { CurrentUser, Roles } from "@shared/decorators";
import { ApplicationRoles } from "@shared/enums";
import { IAccessToken } from "@shared/interfaces/accessToken.interface";

import { RequestPhotoUploadUseCase } from "./requestPhotoUpload.useCase";

@ApiTags(API_TAGS.PERSONALS)
@Roles(ApplicationRoles.PERSONAL)
@Controller({ version: "1", path: "profile" })
export class RequestPhotoUploadController {
  constructor(private readonly requestPhotoUploadUseCase: RequestPhotoUploadUseCase) {}

  @ApiOperation({ summary: "Request a presigned URL for profile photo upload" })
  @ApiCreatedResponse()
  @HttpCode(HttpStatus.CREATED)
  @Post("photo/upload-url")
  async handle(@Body() body: { mimeType: string }, @CurrentUser() user: IAccessToken) {
    return this.requestPhotoUploadUseCase.execute(user.personalId!, body);
  }
}
