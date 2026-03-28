import { Body, Controller, HttpCode, HttpStatus, Param, Patch } from "@nestjs/common";
import { ApiNoContentResponse, ApiOperation, ApiTags } from "@nestjs/swagger";

import { API_TAGS } from "@shared/constants";
import { CurrentUser, Roles } from "@shared/decorators";
import { ApplicationRoles } from "@shared/enums";
import { IAccessToken } from "@shared/interfaces/accessToken.interface";

import { ReorderWorkoutDaysRequestDTO } from "./dtos/request.dto";
import { ReorderWorkoutDaysUseCase } from "./reorderWorkoutDays.useCase";

@ApiTags(API_TAGS.WORKOUT_PLANS)
@Roles(ApplicationRoles.PERSONAL)
@Controller({ version: "1", path: ":studentProgramId/workout-days" })
export class ReorderWorkoutDaysController {
  constructor(private readonly reorderWorkoutDaysUseCase: ReorderWorkoutDaysUseCase) {}

  @ApiOperation({ summary: "Reorder workout days within a student program" })
  @ApiNoContentResponse()
  @HttpCode(HttpStatus.NO_CONTENT)
  @Patch("reorder")
  async handle(
    @Param("studentProgramId") studentProgramId: string,
    @Body() body: ReorderWorkoutDaysRequestDTO,
    @CurrentUser() user: IAccessToken,
  ) {
    return this.reorderWorkoutDaysUseCase.execute(studentProgramId, body, user.personalId!);
  }
}
