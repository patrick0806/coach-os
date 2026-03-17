import { Body, Controller, HttpCode, HttpStatus, Post } from "@nestjs/common";
import { ApiCreatedResponse, ApiOperation, ApiTags } from "@nestjs/swagger";

import { API_TAGS } from "@shared/constants";
import { CurrentUser, Roles } from "@shared/decorators";
import { ApplicationRoles } from "@shared/enums";
import { IAccessToken } from "@shared/interfaces/accessToken.interface";

import { RecordExerciseSetRequestDTO } from "./dtos/request.dto";
import { RecordExerciseSetResponseDTO } from "./dtos/response.dto";
import { RecordExerciseSetUseCase } from "./recordSet.useCase";

@ApiTags(API_TAGS.WORKOUT_EXECUTION)
@Roles(ApplicationRoles.PERSONAL)
@Controller({ version: "1" })
export class RecordExerciseSetController {
  constructor(private readonly recordExerciseSetUseCase: RecordExerciseSetUseCase) {}

  @ApiOperation({ summary: "Record an exercise set in a workout execution" })
  @ApiCreatedResponse({ type: RecordExerciseSetResponseDTO })
  @HttpCode(HttpStatus.CREATED)
  @Post()
  async handle(
    @Body() body: RecordExerciseSetRequestDTO,
    @CurrentUser() user: IAccessToken,
  ) {
    return this.recordExerciseSetUseCase.execute(body, user.personalId!);
  }
}
