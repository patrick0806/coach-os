import { Body, Controller, HttpCode, HttpStatus, Post } from "@nestjs/common";
import { ApiCreatedResponse, ApiOperation, ApiTags } from "@nestjs/swagger";

import { CurrentUser, Roles } from "@shared/decorators";
import { ApplicationRoles } from "@shared/enums";
import { IAccessToken } from "@shared/interfaces";
import { API_TAGS } from "@shared/constants";

import { CreateExerciseService } from "./create-exercise.service";
import { CreateExerciseDTO } from "./dtos/request.dto";
import { ExerciseResponseDTO } from "../list-exercises/dtos/response.dto";

@Roles(ApplicationRoles.PERSONAL)
@ApiTags(API_TAGS.EXERCISES)
@Controller({ version: "1", path: "" })
export class CreateExerciseController {
  constructor(private readonly createExerciseService: CreateExerciseService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: "Create a custom exercise for the authenticated personal" })
  @ApiCreatedResponse({ type: ExerciseResponseDTO })
  handle(
    @Body() dto: CreateExerciseDTO,
    @CurrentUser() user: IAccessToken,
  ): Promise<ExerciseResponseDTO> {
    return this.createExerciseService.execute(dto, user);
  }
}
