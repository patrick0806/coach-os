import { Body, Controller, HttpCode, HttpStatus, Post } from "@nestjs/common";
import { ApiOkResponse, ApiOperation, ApiTags } from "@nestjs/swagger";

import { CurrentUser, Roles } from "@shared/decorators";
import { ApplicationRoles } from "@shared/enums";
import { IAccessToken } from "@shared/interfaces";
import { API_TAGS } from "@shared/constants";
import { validate } from "@shared/utils";

import { UploadImageService } from "./upload-image.service";
import { UploadImageSchema } from "./dtos/request.dto";
import { UploadImageResponseDTO } from "./dtos/response.dto";

@Roles(ApplicationRoles.PERSONAL)
@ApiTags(API_TAGS.PERSONALS)
@Controller({ version: "1", path: "me/profile/upload" })
export class UploadImageController {
  constructor(private readonly uploadImageService: UploadImageService) {}

  @Post()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Generate presigned URL for image upload to S3" })
  @ApiOkResponse({ type: UploadImageResponseDTO })
  async handle(
    @Body() body: unknown,
    @CurrentUser() user: IAccessToken,
  ): Promise<UploadImageResponseDTO> {
    const dto = validate(UploadImageSchema, body);
    return this.uploadImageService.execute(user.profileId, dto);
  }
}
