import { Controller, Get, Query } from "@nestjs/common";
import { ApiOkResponse, ApiOperation, ApiQuery, ApiTags } from "@nestjs/swagger";

import { API_TAGS } from "@shared/constants";
import { CurrentUser, Roles } from "@shared/decorators";
import { ApplicationRoles } from "@shared/enums";
import { IAccessToken } from "@shared/interfaces/accessToken.interface";

import { ListExercisesResponseDTO } from "./dtos/response.dto";
import { ListExercisesUseCase } from "./listExercises.useCase";

@ApiTags(API_TAGS.EXERCISES)
@Roles(ApplicationRoles.PERSONAL)
@Controller({ version: "1" })
export class ListExercisesController {
  constructor(private readonly listExercisesUseCase: ListExercisesUseCase) {}

  @ApiOperation({ summary: "List exercises (global + coach private)" })
  @ApiOkResponse({ type: ListExercisesResponseDTO })
  @ApiQuery({ name: "page", required: false, type: Number })
  @ApiQuery({ name: "size", required: false, type: Number })
  @ApiQuery({ name: "search", required: false, type: String })
  @ApiQuery({ name: "muscleGroup", required: false, type: String })
  @Get()
  async handle(@Query() query: Record<string, string>, @CurrentUser() user: IAccessToken) {
    return this.listExercisesUseCase.execute(query, user.personalId!);
  }
}
