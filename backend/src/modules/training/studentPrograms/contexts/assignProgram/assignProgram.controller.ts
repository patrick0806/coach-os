import { Body, Controller, HttpCode, HttpStatus, Param, Post } from "@nestjs/common";
import { ApiCreatedResponse, ApiOperation, ApiTags } from "@nestjs/swagger";

import { API_TAGS } from "@shared/constants";
import { CurrentUser, Roles } from "@shared/decorators";
import { ApplicationRoles } from "@shared/enums";
import { IAccessToken } from "@shared/interfaces/accessToken.interface";

import { AssignProgramRequestDTO } from "./dtos/request.dto";
import { AssignProgramResponseDTO } from "./dtos/response.dto";
import { AssignProgramUseCase } from "./assignProgram.useCase";

@ApiTags(API_TAGS.WORKOUT_PLANS)
@Roles(ApplicationRoles.PERSONAL)
@Controller({ version: "1", path: "students/:studentId/programs" })
export class AssignProgramController {
  constructor(private readonly assignProgramUseCase: AssignProgramUseCase) {}

  @ApiOperation({ summary: "Assign a training program to a student" })
  @ApiCreatedResponse({ type: AssignProgramResponseDTO })
  @HttpCode(HttpStatus.CREATED)
  @Post()
  async handle(
    @Param("studentId") studentId: string,
    @Body() body: AssignProgramRequestDTO,
    @CurrentUser() user: IAccessToken,
  ) {
    return this.assignProgramUseCase.execute(studentId, body, user.personalId!);
  }
}
