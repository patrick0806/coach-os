import { Controller, Get, HttpCode, HttpStatus, Param, Query } from "@nestjs/common";
import { ApiOkResponse, ApiOperation, ApiTags } from "@nestjs/swagger";

import { API_TAGS } from "@shared/constants";
import { CurrentUser, Roles } from "@shared/decorators";
import { ApplicationRoles } from "@shared/enums";
import { IAccessToken } from "@shared/interfaces/accessToken.interface";

import { ListStudentProgramsUseCase } from "./listStudentPrograms.useCase";

@ApiTags(API_TAGS.WORKOUT_PLANS)
@Roles(ApplicationRoles.PERSONAL)
@Controller({ version: "1", path: "students/:studentId/programs" })
export class ListStudentProgramsController {
  constructor(
    private readonly listStudentProgramsUseCase: ListStudentProgramsUseCase,
  ) {}

  @ApiOperation({ summary: "List programs assigned to a student" })
  @ApiOkResponse()
  @HttpCode(HttpStatus.OK)
  @Get()
  async handle(
    @Param("studentId") studentId: string,
    @Query() query: Record<string, string>,
    @CurrentUser() user: IAccessToken,
  ) {
    return this.listStudentProgramsUseCase.execute(studentId, query, user.personalId!);
  }
}
