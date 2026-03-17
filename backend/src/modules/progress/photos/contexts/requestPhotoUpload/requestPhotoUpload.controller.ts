import { Body, Controller, HttpCode, HttpStatus, Param, Post } from "@nestjs/common";
import { ApiNotFoundResponse, ApiOkResponse, ApiOperation, ApiTags } from "@nestjs/swagger";

import { API_TAGS } from "@shared/constants";
import { CurrentUser, Roles } from "@shared/decorators";
import { ApplicationRoles } from "@shared/enums";
import { IAccessToken } from "@shared/interfaces/accessToken.interface";

import { RequestPhotoUploadRequestDTO } from "./dtos/request.dto";
import { RequestPhotoUploadResponseDTO } from "./dtos/response.dto";
import { RequestPhotoUploadUseCase } from "./requestPhotoUpload.useCase";

@ApiTags(API_TAGS.STUDENTS)
@Roles(ApplicationRoles.PERSONAL)
@Controller({ version: "1", path: "students/:studentId/progress-photos" })
export class RequestPhotoUploadController {
  constructor(private readonly requestPhotoUploadUseCase: RequestPhotoUploadUseCase) {}

  @ApiOperation({ summary: "Request presigned URL to upload a progress photo" })
  @ApiOkResponse({ type: RequestPhotoUploadResponseDTO })
  @ApiNotFoundResponse({ description: "Student not found" })
  @HttpCode(HttpStatus.OK)
  @Post("upload-url")
  async handle(
    @Param("studentId") studentId: string,
    @Body() body: RequestPhotoUploadRequestDTO,
    @CurrentUser() user: IAccessToken,
  ) {
    return this.requestPhotoUploadUseCase.execute(studentId, body, user.personalId!);
  }
}
