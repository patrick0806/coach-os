import { Body, Controller, HttpCode, HttpStatus, Param, Post } from "@nestjs/common";
import { ApiForbiddenResponse, ApiNotFoundResponse, ApiOkResponse, ApiOperation, ApiTags } from "@nestjs/swagger";

import { API_TAGS } from "@shared/constants";
import { CurrentUser, Roles } from "@shared/decorators";
import { ApplicationRoles } from "@shared/enums";
import { IAccessToken } from "@shared/interfaces/accessToken.interface";

import { RequestUploadUrlRequestDTO } from "./dtos/request.dto";
import { RequestUploadUrlResponseDTO } from "./dtos/response.dto";
import { RequestUploadUrlUseCase } from "./requestUploadUrl.useCase";

@ApiTags(API_TAGS.EXERCISES)
@Roles(ApplicationRoles.PERSONAL)
@Controller({ version: "1" })
export class RequestUploadUrlController {
  constructor(private readonly requestUploadUrlUseCase: RequestUploadUrlUseCase) {}

  @ApiOperation({ summary: "Request presigned URL to upload exercise media" })
  @ApiOkResponse({ type: RequestUploadUrlResponseDTO })
  @ApiNotFoundResponse({ description: "Exercise not found" })
  @ApiForbiddenResponse({ description: "Cannot upload to global or other tenant exercises" })
  @HttpCode(HttpStatus.OK)
  @Post(":id/upload-url")
  async handle(
    @Param("id") id: string,
    @Body() body: RequestUploadUrlRequestDTO,
    @CurrentUser() user: IAccessToken,
  ) {
    return this.requestUploadUrlUseCase.execute(id, body, user.personalId!);
  }
}
