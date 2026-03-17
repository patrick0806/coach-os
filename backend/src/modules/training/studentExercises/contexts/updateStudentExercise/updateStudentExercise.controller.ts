import { Body, Controller, HttpCode, HttpStatus, Param, Put } from "@nestjs/common";
import { ApiOkResponse, ApiOperation, ApiTags } from "@nestjs/swagger";

import { API_TAGS } from "@shared/constants";
import { CurrentUser, Roles } from "@shared/decorators";
import { ApplicationRoles } from "@shared/enums";
import { IAccessToken } from "@shared/interfaces/accessToken.interface";

import { UpdateStudentExerciseRequestDTO } from "./dtos/request.dto";
import { UpdateStudentExerciseResponseDTO } from "./dtos/response.dto";
import { UpdateStudentExerciseUseCase } from "./updateStudentExercise.useCase";

@ApiTags(API_TAGS.WORKOUT_PLANS)
@Roles(ApplicationRoles.PERSONAL)
@Controller({ version: "1" })
export class UpdateStudentExerciseController {
  constructor(
    private readonly updateStudentExerciseUseCase: UpdateStudentExerciseUseCase,
  ) {}

  @ApiOperation({ summary: "Update a student exercise" })
  @ApiOkResponse({ type: UpdateStudentExerciseResponseDTO })
  @HttpCode(HttpStatus.OK)
  @Put(":id")
  async handle(
    @Param("id") id: string,
    @Body() body: UpdateStudentExerciseRequestDTO,
    @CurrentUser() user: IAccessToken,
  ) {
    return this.updateStudentExerciseUseCase.execute(id, body, user.personalId!);
  }
}
