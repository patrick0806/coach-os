import { Body, Controller, HttpCode, HttpStatus, Param, Patch } from "@nestjs/common";
import { ApiNoContentResponse, ApiOperation, ApiTags } from "@nestjs/swagger";

import { API_TAGS } from "@shared/constants";
import { CurrentUser, Roles } from "@shared/decorators";
import { ApplicationRoles } from "@shared/enums";
import { IAccessToken } from "@shared/interfaces/accessToken.interface";

import { ReorderStudentExercisesRequestDTO } from "./dtos/request.dto";
import { ReorderStudentExercisesUseCase } from "./reorderStudentExercises.useCase";

@ApiTags(API_TAGS.WORKOUT_PLANS)
@Roles(ApplicationRoles.PERSONAL)
@Controller({ version: "1" })
export class ReorderStudentExercisesController {
  constructor(private readonly reorderStudentExercisesUseCase: ReorderStudentExercisesUseCase) {}

  @ApiOperation({ summary: "Reorder exercises within a workout day" })
  @ApiNoContentResponse()
  @HttpCode(HttpStatus.NO_CONTENT)
  @Patch(":id/exercises/reorder")
  async handle(
    @Param("id") id: string,
    @Body() body: ReorderStudentExercisesRequestDTO,
    @CurrentUser() user: IAccessToken,
  ) {
    return this.reorderStudentExercisesUseCase.execute(id, body, user.personalId!);
  }
}
