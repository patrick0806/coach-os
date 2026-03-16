import { Body, Controller, HttpCode, HttpStatus, Post } from "@nestjs/common";
import { ApiCreatedResponse, ApiOperation, ApiTags } from "@nestjs/swagger";

import { API_TAGS } from "@shared/constants";
import { CurrentUser, Roles } from "@shared/decorators";
import { ApplicationRoles } from "@shared/enums";
import { IAccessToken } from "@shared/interfaces/accessToken.interface";

import { CreateExerciseRequestDTO } from "./dtos/request.dto";
import { CreateExerciseResponseDTO } from "./dtos/response.dto";
import { CreateExerciseUseCase } from "./createExercise.useCase";

@ApiTags(API_TAGS.EXERCISES)
@Roles(ApplicationRoles.PERSONAL)
@Controller({ version: "1" })
export class CreateExerciseController {
  constructor(private readonly createExerciseUseCase: CreateExerciseUseCase) {}

  @ApiOperation({ summary: "Create a private exercise" })
  @ApiCreatedResponse({ type: CreateExerciseResponseDTO })
  @HttpCode(HttpStatus.CREATED)
  @Post()
  async handle(@Body() body: CreateExerciseRequestDTO, @CurrentUser() user: IAccessToken) {
    return this.createExerciseUseCase.execute(body, user.personalId!);
  }
}
