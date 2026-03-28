import { Body, Controller, HttpCode, HttpStatus, Param, Post } from "@nestjs/common";
import { ApiCreatedResponse, ApiOperation, ApiTags } from "@nestjs/swagger";

import { API_TAGS } from "@shared/constants";
import { CurrentUser, Roles } from "@shared/decorators";
import { ApplicationRoles } from "@shared/enums";
import { IAccessToken } from "@shared/interfaces/accessToken.interface";

import { AddStudentExerciseRequestDTO } from "./dtos/request.dto";
import { AddStudentExerciseResponseDTO } from "./dtos/response.dto";
import { AddStudentExerciseUseCase } from "./addStudentExercise.useCase";

@ApiTags(API_TAGS.WORKOUT_PLANS)
@Roles(ApplicationRoles.PERSONAL)
@Controller({ version: "1" })
export class AddStudentExerciseController {
  constructor(private readonly addStudentExerciseUseCase: AddStudentExerciseUseCase) {}

  @ApiOperation({ summary: "Add an exercise to a workout day" })
  @ApiCreatedResponse({ type: AddStudentExerciseResponseDTO })
  @HttpCode(HttpStatus.CREATED)
  @Post(":id/exercises")
  async handle(
    @Param("id") id: string,
    @Body() body: AddStudentExerciseRequestDTO,
    @CurrentUser() user: IAccessToken,
  ) {
    return this.addStudentExerciseUseCase.execute(id, body, user.personalId!);
  }
}
