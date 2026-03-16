import { Controller, Get, Param } from "@nestjs/common";
import { ApiOkResponse, ApiOperation, ApiTags } from "@nestjs/swagger";

import { API_TAGS } from "@shared/constants";
import { CurrentUser, Roles } from "@shared/decorators";
import { ApplicationRoles } from "@shared/enums";
import { IAccessToken } from "@shared/interfaces/accessToken.interface";

import { GetStudentResponseDTO } from "./dtos/response.dto";
import { GetStudentUseCase } from "./getStudent.useCase";

@ApiTags(API_TAGS.STUDENTS)
@Roles(ApplicationRoles.PERSONAL)
@Controller({ version: "1" })
export class GetStudentController {
  constructor(private readonly getStudentUseCase: GetStudentUseCase) {}

  @ApiOperation({ summary: "Get student by ID" })
  @ApiOkResponse({ type: GetStudentResponseDTO })
  @Get(":id")
  async handle(@Param("id") id: string, @CurrentUser() user: IAccessToken) {
    return this.getStudentUseCase.execute(id, user.personalId!);
  }
}
