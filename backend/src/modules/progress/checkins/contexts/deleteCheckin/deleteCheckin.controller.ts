import { Controller, Delete, HttpCode, HttpStatus, Param } from "@nestjs/common";
import { ApiNoContentResponse, ApiNotFoundResponse, ApiOperation, ApiTags } from "@nestjs/swagger";

import { API_TAGS } from "@shared/constants";
import { CurrentUser, Roles } from "@shared/decorators";
import { ApplicationRoles } from "@shared/enums";
import { IAccessToken } from "@shared/interfaces/accessToken.interface";

import { DeleteCheckinUseCase } from "./deleteCheckin.useCase";

@ApiTags(API_TAGS.STUDENTS)
@Roles(ApplicationRoles.PERSONAL)
@Controller({ version: "1", path: "progress-checkins" })
export class DeleteCheckinController {
  constructor(private readonly deleteCheckinUseCase: DeleteCheckinUseCase) {}

  @ApiOperation({ summary: "Delete a progress checkin" })
  @ApiNoContentResponse({ description: "Checkin deleted" })
  @ApiNotFoundResponse({ description: "Checkin not found" })
  @HttpCode(HttpStatus.NO_CONTENT)
  @Delete(":id")
  async handle(@Param("id") id: string, @CurrentUser() user: IAccessToken) {
    return this.deleteCheckinUseCase.execute(id, user.personalId!);
  }
}
