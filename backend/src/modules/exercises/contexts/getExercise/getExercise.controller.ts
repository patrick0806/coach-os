import { Controller, Get, Param } from "@nestjs/common";
import { ApiNotFoundResponse, ApiOkResponse, ApiOperation, ApiTags } from "@nestjs/swagger";

import { API_TAGS } from "@shared/constants";
import { CurrentUser, Roles } from "@shared/decorators";
import { ApplicationRoles } from "@shared/enums";
import { IAccessToken } from "@shared/interfaces/accessToken.interface";

import { GetExerciseResponseDTO } from "./dtos/response.dto";
import { GetExerciseUseCase } from "./getExercise.useCase";

@ApiTags(API_TAGS.EXERCISES)
@Roles(ApplicationRoles.PERSONAL)
@Controller({ version: "1" })
export class GetExerciseController {
  constructor(private readonly getExerciseUseCase: GetExerciseUseCase) {}

  @ApiOperation({ summary: "Get exercise by ID" })
  @ApiOkResponse({ type: GetExerciseResponseDTO })
  @ApiNotFoundResponse({ description: "Exercise not found" })
  @Get(":id")
  async handle(@Param("id") id: string, @CurrentUser() user: IAccessToken) {
    return this.getExerciseUseCase.execute(id, user.personalId!);
  }
}
