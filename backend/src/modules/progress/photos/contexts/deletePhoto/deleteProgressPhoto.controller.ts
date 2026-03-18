import { Controller, Delete, HttpCode, HttpStatus, Param } from "@nestjs/common";
import { ApiNoContentResponse, ApiNotFoundResponse, ApiOperation, ApiTags } from "@nestjs/swagger";

import { API_TAGS } from "@shared/constants";
import { CurrentUser, Roles } from "@shared/decorators";
import { ApplicationRoles } from "@shared/enums";
import { IAccessToken } from "@shared/interfaces/accessToken.interface";

import { DeleteProgressPhotoUseCase } from "./deleteProgressPhoto.useCase";

@ApiTags(API_TAGS.STUDENTS)
@Roles(ApplicationRoles.PERSONAL)
@Controller({ version: "1", path: "progress-photos" })
export class DeleteProgressPhotoController {
  constructor(private readonly deleteProgressPhotoUseCase: DeleteProgressPhotoUseCase) {}

  @ApiOperation({ summary: "Delete a progress photo" })
  @ApiNoContentResponse()
  @ApiNotFoundResponse({ description: "Progress photo not found" })
  @HttpCode(HttpStatus.NO_CONTENT)
  @Delete(":id")
  async handle(
    @Param("id") id: string,
    @CurrentUser() user: IAccessToken,
  ) {
    return this.deleteProgressPhotoUseCase.execute(id, user.personalId!);
  }
}
