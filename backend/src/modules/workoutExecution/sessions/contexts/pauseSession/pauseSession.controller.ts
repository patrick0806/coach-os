import { Controller, HttpCode, HttpStatus, Param, Patch } from "@nestjs/common";
import { ApiOkResponse, ApiOperation, ApiTags } from "@nestjs/swagger";

import { API_TAGS } from "@shared/constants";
import { CurrentUser, Roles } from "@shared/decorators";
import { ApplicationRoles } from "@shared/enums";
import { IAccessToken } from "@shared/interfaces/accessToken.interface";

import { PauseWorkoutSessionResponseDTO } from "./dtos/response.dto";
import { PauseWorkoutSessionUseCase } from "./pauseSession.useCase";

@ApiTags(API_TAGS.WORKOUT_EXECUTION)
@Roles(ApplicationRoles.PERSONAL, ApplicationRoles.STUDENT)
@Controller({ version: "1" })
export class PauseWorkoutSessionController {
  constructor(private readonly pauseWorkoutSessionUseCase: PauseWorkoutSessionUseCase) {}

  @ApiOperation({ summary: "Pause a workout session" })
  @ApiOkResponse({ type: PauseWorkoutSessionResponseDTO })
  @HttpCode(HttpStatus.OK)
  @Patch(":id/pause")
  async handle(
    @Param("id") id: string,
    @CurrentUser() user: IAccessToken,
  ) {
    return this.pauseWorkoutSessionUseCase.execute(id, user.personalId!);
  }
}
