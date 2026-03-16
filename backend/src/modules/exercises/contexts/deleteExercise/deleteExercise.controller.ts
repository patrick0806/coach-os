import { Controller, Delete, HttpCode, HttpStatus, Param } from "@nestjs/common";
import { ApiForbiddenResponse, ApiNoContentResponse, ApiNotFoundResponse, ApiOperation, ApiTags } from "@nestjs/swagger";

import { API_TAGS } from "@shared/constants";
import { CurrentUser, Roles } from "@shared/decorators";
import { ApplicationRoles } from "@shared/enums";
import { IAccessToken } from "@shared/interfaces/accessToken.interface";

import { DeleteExerciseUseCase } from "./deleteExercise.useCase";

@ApiTags(API_TAGS.EXERCISES)
@Roles(ApplicationRoles.PERSONAL)
@Controller({ version: "1" })
export class DeleteExerciseController {
  constructor(private readonly deleteExerciseUseCase: DeleteExerciseUseCase) {}

  @ApiOperation({ summary: "Delete a private exercise" })
  @ApiNoContentResponse({ description: "Exercise deleted" })
  @ApiNotFoundResponse({ description: "Exercise not found" })
  @ApiForbiddenResponse({ description: "Cannot delete global or other tenant exercises" })
  @HttpCode(HttpStatus.NO_CONTENT)
  @Delete(":id")
  async handle(@Param("id") id: string, @CurrentUser() user: IAccessToken) {
    return this.deleteExerciseUseCase.execute(id, user.personalId!);
  }
}
