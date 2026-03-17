import { Body, Controller, HttpCode, HttpStatus, Param, Post } from "@nestjs/common";
import { ApiCreatedResponse, ApiOperation, ApiTags } from "@nestjs/swagger";

import { API_TAGS } from "@shared/constants";
import { CurrentUser, Roles } from "@shared/decorators";
import { ApplicationRoles } from "@shared/enums";
import { IAccessToken } from "@shared/interfaces/accessToken.interface";

import { AddExerciseTemplateRequestDTO } from "./dtos/request.dto";
import { AddExerciseTemplateResponseDTO } from "./dtos/response.dto";
import { AddExerciseTemplateUseCase } from "./addExerciseTemplate.useCase";

@ApiTags(API_TAGS.WORKOUT_PLANS)
@Roles(ApplicationRoles.PERSONAL)
@Controller({ version: "1" })
export class AddExerciseTemplateController {
  constructor(
    private readonly addExerciseTemplateUseCase: AddExerciseTemplateUseCase,
  ) {}

  @ApiOperation({ summary: "Add an exercise template to a workout template" })
  @ApiCreatedResponse({ type: AddExerciseTemplateResponseDTO })
  @HttpCode(HttpStatus.CREATED)
  @Post(":id/exercises")
  async handle(
    @Param("id") id: string,
    @Body() body: AddExerciseTemplateRequestDTO,
    @CurrentUser() user: IAccessToken,
  ) {
    return this.addExerciseTemplateUseCase.execute(id, body, user.personalId!);
  }
}
