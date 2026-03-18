import { Controller, Get, Param, Query } from "@nestjs/common";
import { ApiOkResponse, ApiNotFoundResponse, ApiOperation, ApiTags } from "@nestjs/swagger";

import { API_TAGS } from "@shared/constants";
import { CurrentUser, Roles } from "@shared/decorators";
import { ApplicationRoles } from "@shared/enums";
import { IAccessToken } from "@shared/interfaces/accessToken.interface";

import { ListCheckinsUseCase } from "./listCheckins.useCase";

@ApiTags(API_TAGS.STUDENTS)
@Roles(ApplicationRoles.PERSONAL)
@Controller({ version: "1", path: "students/:studentId/progress-checkins" })
export class ListCheckinsController {
  constructor(private readonly listCheckinsUseCase: ListCheckinsUseCase) {}

  @ApiOperation({ summary: "List progress checkins for a student" })
  @ApiOkResponse({ description: "Paginated checkins list" })
  @ApiNotFoundResponse({ description: "Student not found" })
  @Get()
  async handle(
    @Param("studentId") studentId: string,
    @Query("page") page = "0",
    @Query("size") size = "10",
    @CurrentUser() user: IAccessToken,
  ) {
    return this.listCheckinsUseCase.execute(studentId, user.personalId!, {
      page: Number(page),
      size: Number(size),
    });
  }
}
