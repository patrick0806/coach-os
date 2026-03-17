import { Controller, Get, HttpCode, HttpStatus, Param } from "@nestjs/common";
import { ApiOkResponse, ApiOperation, ApiTags } from "@nestjs/swagger";

import { API_TAGS } from "@shared/constants";
import { CurrentUser, Roles } from "@shared/decorators";
import { ApplicationRoles } from "@shared/enums";
import { IAccessToken } from "@shared/interfaces/accessToken.interface";

import { GetWorkoutSessionResponseDTO } from "./dtos/response.dto";
import { GetWorkoutSessionUseCase } from "./getSession.useCase";

@ApiTags(API_TAGS.WORKOUT_EXECUTION)
@Roles(ApplicationRoles.PERSONAL)
@Controller({ version: "1" })
export class GetWorkoutSessionController {
  constructor(private readonly getWorkoutSessionUseCase: GetWorkoutSessionUseCase) {}

  @ApiOperation({ summary: "Get a workout session with executions and sets" })
  @ApiOkResponse({ type: GetWorkoutSessionResponseDTO })
  @HttpCode(HttpStatus.OK)
  @Get(":id")
  async handle(
    @Param("id") id: string,
    @CurrentUser() user: IAccessToken,
  ) {
    return this.getWorkoutSessionUseCase.execute(id, user.personalId!);
  }
}
