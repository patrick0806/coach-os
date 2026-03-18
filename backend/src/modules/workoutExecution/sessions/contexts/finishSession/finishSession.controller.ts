import { Controller, HttpCode, HttpStatus, Param, Patch } from "@nestjs/common";
import { ApiOkResponse, ApiOperation, ApiTags } from "@nestjs/swagger";

import { API_TAGS } from "@shared/constants";
import { CurrentUser, Roles } from "@shared/decorators";
import { ApplicationRoles } from "@shared/enums";
import { IAccessToken } from "@shared/interfaces/accessToken.interface";

import { FinishWorkoutSessionResponseDTO } from "./dtos/response.dto";
import { FinishWorkoutSessionUseCase } from "./finishSession.useCase";

@ApiTags(API_TAGS.WORKOUT_EXECUTION)
@Roles(ApplicationRoles.PERSONAL, ApplicationRoles.STUDENT)
@Controller({ version: "1" })
export class FinishWorkoutSessionController {
  constructor(private readonly finishWorkoutSessionUseCase: FinishWorkoutSessionUseCase) {}

  @ApiOperation({ summary: "Finish a workout session" })
  @ApiOkResponse({ type: FinishWorkoutSessionResponseDTO })
  @HttpCode(HttpStatus.OK)
  @Patch(":id/finish")
  async handle(
    @Param("id") id: string,
    @CurrentUser() user: IAccessToken,
  ) {
    return this.finishWorkoutSessionUseCase.execute(id, user.personalId!);
  }
}
