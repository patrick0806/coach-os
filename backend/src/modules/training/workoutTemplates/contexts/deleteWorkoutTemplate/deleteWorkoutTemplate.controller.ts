import { Controller, Delete, HttpCode, HttpStatus, Param } from "@nestjs/common";
import { ApiNoContentResponse, ApiOperation, ApiTags } from "@nestjs/swagger";

import { API_TAGS } from "@shared/constants";
import { CurrentUser, Roles } from "@shared/decorators";
import { ApplicationRoles } from "@shared/enums";
import { IAccessToken } from "@shared/interfaces/accessToken.interface";

import { DeleteWorkoutTemplateUseCase } from "./deleteWorkoutTemplate.useCase";

@ApiTags(API_TAGS.WORKOUT_PLANS)
@Roles(ApplicationRoles.PERSONAL)
@Controller({ version: "1" })
export class DeleteWorkoutTemplateController {
  constructor(
    private readonly deleteWorkoutTemplateUseCase: DeleteWorkoutTemplateUseCase,
  ) {}

  @ApiOperation({ summary: "Delete a workout template" })
  @ApiNoContentResponse()
  @HttpCode(HttpStatus.NO_CONTENT)
  @Delete(":id")
  async handle(
    @Param("id") id: string,
    @CurrentUser() user: IAccessToken,
  ) {
    return this.deleteWorkoutTemplateUseCase.execute(id, user.personalId!);
  }
}
