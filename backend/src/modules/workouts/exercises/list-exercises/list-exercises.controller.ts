import { Controller, Get, Query } from "@nestjs/common";
import { ApiOkResponse, ApiOperation, ApiQuery, ApiTags } from "@nestjs/swagger";

import { CurrentUser, Roles } from "@shared/decorators";
import { ApplicationRoles } from "@shared/enums";
import { IAccessToken } from "@shared/interfaces";
import { API_TAGS } from "@shared/constants";

import { ListExercisesService } from "./list-exercises.service";
import { ExerciseResponseDTO } from "./dtos/response.dto";

@Roles(ApplicationRoles.PERSONAL)
@ApiTags(API_TAGS.EXERCISES)
@Controller({ version: "1", path: "" })
export class ListExercisesController {
  constructor(private readonly listExercisesService: ListExercisesService) {}

  @Get()
  @ApiOperation({ summary: "List exercises (globals + own custom exercises)" })
  @ApiQuery({ name: "muscleGroup", required: false, example: "peito" })
  @ApiQuery({ name: "search", required: false })
  @ApiOkResponse({ type: [ExerciseResponseDTO] })
  handle(
    @CurrentUser() user: IAccessToken,
    @Query("muscleGroup") muscleGroup?: string,
    @Query("search") search?: string,
  ): Promise<ExerciseResponseDTO[]> {
    return this.listExercisesService.execute(user, { muscleGroup, search });
  }
}
