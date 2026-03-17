import { Body, Controller, HttpCode, HttpStatus, Param, Patch } from "@nestjs/common";
import { ApiNoContentResponse, ApiOperation, ApiTags } from "@nestjs/swagger";

import { API_TAGS } from "@shared/constants";
import { CurrentUser, Roles } from "@shared/decorators";
import { ApplicationRoles } from "@shared/enums";
import { IAccessToken } from "@shared/interfaces/accessToken.interface";

import { ReorderWorkoutTemplatesRequestDTO } from "./dtos/request.dto";
import { ReorderWorkoutTemplatesUseCase } from "./reorderWorkoutTemplates.useCase";

@ApiTags(API_TAGS.WORKOUT_PLANS)
@Roles(ApplicationRoles.PERSONAL)
@Controller({ version: "1" })
export class ReorderWorkoutTemplatesController {
  constructor(
    private readonly reorderWorkoutTemplatesUseCase: ReorderWorkoutTemplatesUseCase,
  ) {}

  @ApiOperation({ summary: "Reorder workout templates within a program template" })
  @ApiNoContentResponse()
  @HttpCode(HttpStatus.NO_CONTENT)
  @Patch(":id/workouts/reorder")
  async handle(
    @Param("id") id: string,
    @Body() body: ReorderWorkoutTemplatesRequestDTO,
    @CurrentUser() user: IAccessToken,
  ) {
    return this.reorderWorkoutTemplatesUseCase.execute(id, body, user.personalId!);
  }
}
