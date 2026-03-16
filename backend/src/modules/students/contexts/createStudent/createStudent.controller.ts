import { Body, Controller, HttpCode, HttpStatus, Post } from "@nestjs/common";
import { ApiCreatedResponse, ApiOperation, ApiTags } from "@nestjs/swagger";

import { API_TAGS } from "@shared/constants";
import { CurrentUser, Roles } from "@shared/decorators";
import { ApplicationRoles } from "@shared/enums";
import { IAccessToken } from "@shared/interfaces/accessToken.interface";

import { CreateStudentRequestDTO } from "./dtos/request.dto";
import { CreateStudentResponseDTO } from "./dtos/response.dto";
import { CreateStudentUseCase } from "./createStudent.useCase";

@ApiTags(API_TAGS.STUDENTS)
@Roles(ApplicationRoles.PERSONAL)
@Controller({ version: "1" })
export class CreateStudentController {
  constructor(private readonly createStudentUseCase: CreateStudentUseCase) {}

  @ApiOperation({ summary: "Create a new student" })
  @ApiCreatedResponse({ type: CreateStudentResponseDTO })
  @HttpCode(HttpStatus.CREATED)
  @Post()
  async handle(@Body() body: CreateStudentRequestDTO, @CurrentUser() user: IAccessToken) {
    return this.createStudentUseCase.execute(body, user.personalId!);
  }
}
