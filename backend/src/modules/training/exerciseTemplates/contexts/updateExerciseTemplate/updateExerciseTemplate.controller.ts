import { Body, Controller, HttpCode, HttpStatus, Param, Put } from "@nestjs/common";
import { ApiOkResponse, ApiOperation, ApiTags } from "@nestjs/swagger";

import { API_TAGS } from "@shared/constants";
import { CurrentUser, Roles } from "@shared/decorators";
import { ApplicationRoles } from "@shared/enums";
import { IAccessToken } from "@shared/interfaces/accessToken.interface";

import { UpdateExerciseTemplateRequestDTO } from "./dtos/request.dto";
import { UpdateExerciseTemplateResponseDTO } from "./dtos/response.dto";
import { UpdateExerciseTemplateUseCase } from "./updateExerciseTemplate.useCase";

@ApiTags(API_TAGS.WORKOUT_PLANS)
@Roles(ApplicationRoles.PERSONAL)
@Controller({ version: "1" })
export class UpdateExerciseTemplateController {
  constructor(
    private readonly updateExerciseTemplateUseCase: UpdateExerciseTemplateUseCase,
  ) {}

  @ApiOperation({ summary: "Update an exercise template" })
  @ApiOkResponse({ type: UpdateExerciseTemplateResponseDTO })
  @HttpCode(HttpStatus.OK)
  @Put(":id")
  async handle(
    @Param("id") id: string,
    @Body() body: UpdateExerciseTemplateRequestDTO,
    @CurrentUser() user: IAccessToken,
  ) {
    return this.updateExerciseTemplateUseCase.execute(id, body, user.personalId!);
  }
}
