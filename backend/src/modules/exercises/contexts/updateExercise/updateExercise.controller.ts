import { Body, Controller, Param, Put } from "@nestjs/common";
import { ApiForbiddenResponse, ApiNotFoundResponse, ApiOkResponse, ApiOperation, ApiTags } from "@nestjs/swagger";

import { API_TAGS } from "@shared/constants";
import { CurrentUser, Roles } from "@shared/decorators";
import { ApplicationRoles } from "@shared/enums";
import { IAccessToken } from "@shared/interfaces/accessToken.interface";

import { UpdateExerciseRequestDTO } from "./dtos/request.dto";
import { UpdateExerciseResponseDTO } from "./dtos/response.dto";
import { UpdateExerciseUseCase } from "./updateExercise.useCase";

@ApiTags(API_TAGS.EXERCISES)
@Roles(ApplicationRoles.PERSONAL)
@Controller({ version: "1" })
export class UpdateExerciseController {
  constructor(private readonly updateExerciseUseCase: UpdateExerciseUseCase) {}

  @ApiOperation({ summary: "Update a private exercise" })
  @ApiOkResponse({ type: UpdateExerciseResponseDTO })
  @ApiNotFoundResponse({ description: "Exercise not found" })
  @ApiForbiddenResponse({ description: "Cannot update global or other tenant exercises" })
  @Put(":id")
  async handle(
    @Param("id") id: string,
    @Body() body: UpdateExerciseRequestDTO,
    @CurrentUser() user: IAccessToken,
  ) {
    return this.updateExerciseUseCase.execute(id, body, user.personalId!);
  }
}
