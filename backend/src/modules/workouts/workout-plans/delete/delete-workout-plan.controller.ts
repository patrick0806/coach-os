import { Controller, Delete, HttpCode, HttpStatus, Param } from "@nestjs/common";
import { ApiNoContentResponse, ApiOperation, ApiTags } from "@nestjs/swagger";

import { CurrentUser, Roles } from "@shared/decorators";
import { ApplicationRoles } from "@shared/enums";
import { IAccessToken } from "@shared/interfaces";
import { API_TAGS } from "@shared/constants";

import { DeleteWorkoutPlanService } from "./delete-workout-plan.service";

@Roles(ApplicationRoles.PERSONAL)
@ApiTags(API_TAGS.WORKOUT_PLANS)
@Controller({ version: "1", path: "" })
export class DeleteWorkoutPlanController {
  constructor(private readonly deleteWorkoutPlanService: DeleteWorkoutPlanService) {}

  @Delete(":id")
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: "Delete a workout plan and all its exercises" })
  @ApiNoContentResponse()
  handle(
    @Param("id") id: string,
    @CurrentUser() user: IAccessToken,
  ): Promise<void> {
    return this.deleteWorkoutPlanService.execute(id, user);
  }
}
