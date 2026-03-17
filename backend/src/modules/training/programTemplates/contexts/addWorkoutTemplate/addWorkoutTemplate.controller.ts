import { Body, Controller, HttpCode, HttpStatus, Param, Post } from "@nestjs/common";
import { ApiCreatedResponse, ApiOperation, ApiTags } from "@nestjs/swagger";

import { API_TAGS } from "@shared/constants";
import { CurrentUser, Roles } from "@shared/decorators";
import { ApplicationRoles } from "@shared/enums";
import { IAccessToken } from "@shared/interfaces/accessToken.interface";

import { AddWorkoutTemplateRequestDTO } from "./dtos/request.dto";
import { AddWorkoutTemplateResponseDTO } from "./dtos/response.dto";
import { AddWorkoutTemplateUseCase } from "./addWorkoutTemplate.useCase";

@ApiTags(API_TAGS.WORKOUT_PLANS)
@Roles(ApplicationRoles.PERSONAL)
@Controller({ version: "1" })
export class AddWorkoutTemplateController {
  constructor(
    private readonly addWorkoutTemplateUseCase: AddWorkoutTemplateUseCase,
  ) {}

  @ApiOperation({ summary: "Add a workout template to a program template" })
  @ApiCreatedResponse({ type: AddWorkoutTemplateResponseDTO })
  @HttpCode(HttpStatus.CREATED)
  @Post(":id/workouts")
  async handle(
    @Param("id") id: string,
    @Body() body: AddWorkoutTemplateRequestDTO,
    @CurrentUser() user: IAccessToken,
  ) {
    return this.addWorkoutTemplateUseCase.execute(id, body, user.personalId!);
  }
}
