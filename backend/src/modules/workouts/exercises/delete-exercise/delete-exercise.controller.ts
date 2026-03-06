import { Controller, Delete, HttpCode, HttpStatus, Param } from "@nestjs/common";
import { ApiNoContentResponse, ApiOperation, ApiTags } from "@nestjs/swagger";

import { CurrentUser, Roles } from "@shared/decorators";
import { ApplicationRoles } from "@shared/enums";
import { IAccessToken } from "@shared/interfaces";
import { API_TAGS } from "@shared/constants";

import { DeleteExerciseService } from "./delete-exercise.service";

@Roles(ApplicationRoles.PERSONAL)
@ApiTags(API_TAGS.EXERCISES)
@Controller({ version: "1", path: "" })
export class DeleteExerciseController {
  constructor(private readonly deleteExerciseService: DeleteExerciseService) {}

  @Delete(":id")
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: "Delete an owned custom exercise" })
  @ApiNoContentResponse()
  handle(
    @Param("id") id: string,
    @CurrentUser() user: IAccessToken,
  ): Promise<void> {
    return this.deleteExerciseService.execute(id, user);
  }
}
