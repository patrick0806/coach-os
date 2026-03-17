import { Body, Controller, HttpCode, HttpStatus, Param, Patch } from "@nestjs/common";
import { ApiNoContentResponse, ApiOperation, ApiTags } from "@nestjs/swagger";

import { API_TAGS } from "@shared/constants";
import { CurrentUser, Roles } from "@shared/decorators";
import { ApplicationRoles } from "@shared/enums";
import { IAccessToken } from "@shared/interfaces/accessToken.interface";

import { ReorderExerciseTemplatesRequestDTO } from "./dtos/request.dto";
import { ReorderExerciseTemplatesUseCase } from "./reorderExerciseTemplates.useCase";

@ApiTags(API_TAGS.WORKOUT_PLANS)
@Roles(ApplicationRoles.PERSONAL)
@Controller({ version: "1" })
export class ReorderExerciseTemplatesController {
  constructor(
    private readonly reorderExerciseTemplatesUseCase: ReorderExerciseTemplatesUseCase,
  ) {}

  @ApiOperation({ summary: "Reorder exercise templates within a workout template" })
  @ApiNoContentResponse()
  @HttpCode(HttpStatus.NO_CONTENT)
  @Patch(":id/exercises/reorder")
  async handle(
    @Param("id") id: string,
    @Body() body: ReorderExerciseTemplatesRequestDTO,
    @CurrentUser() user: IAccessToken,
  ) {
    return this.reorderExerciseTemplatesUseCase.execute(id, body, user.personalId!);
  }
}
