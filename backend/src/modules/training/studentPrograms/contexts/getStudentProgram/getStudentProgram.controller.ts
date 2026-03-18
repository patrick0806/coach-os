import { Controller, Get, HttpCode, HttpStatus, Param } from "@nestjs/common";
import { ApiOkResponse, ApiOperation, ApiTags } from "@nestjs/swagger";

import { API_TAGS } from "@shared/constants";
import { CurrentUser, Roles } from "@shared/decorators";
import { ApplicationRoles } from "@shared/enums";
import { IAccessToken } from "@shared/interfaces/accessToken.interface";

import { GetStudentProgramUseCase } from "./getStudentProgram.useCase";

@ApiTags(API_TAGS.WORKOUT_PLANS)
@Roles(ApplicationRoles.PERSONAL, ApplicationRoles.STUDENT)
@Controller({ version: "1" })
export class GetStudentProgramController {
  constructor(private readonly getStudentProgramUseCase: GetStudentProgramUseCase) {}

  @ApiOperation({ summary: "Get a student program with full tree" })
  @ApiOkResponse()
  @HttpCode(HttpStatus.OK)
  @Get(":id")
  async handle(
    @Param("id") id: string,
    @CurrentUser() user: IAccessToken,
  ) {
    return this.getStudentProgramUseCase.execute(id, user.personalId!);
  }
}
