import { Controller, Get, HttpCode, HttpStatus, Param, Query } from "@nestjs/common";
import { ApiNotFoundResponse, ApiOkResponse, ApiOperation, ApiTags } from "@nestjs/swagger";

import { API_TAGS } from "@shared/constants";
import { CurrentUser, Roles } from "@shared/decorators";
import { ApplicationRoles } from "@shared/enums";
import { IAccessToken } from "@shared/interfaces/accessToken.interface";

import { GetChartDataUseCase } from "./getChartData.useCase";

@ApiTags(API_TAGS.STUDENTS)
@Roles(ApplicationRoles.PERSONAL)
@Controller({ version: "1", path: "students/:studentId/progress-records" })
export class GetChartDataController {
  constructor(private readonly getChartDataUseCase: GetChartDataUseCase) {}

  @ApiOperation({ summary: "Get progress chart data for a student" })
  @ApiOkResponse()
  @ApiNotFoundResponse({ description: "Student not found" })
  @HttpCode(HttpStatus.OK)
  @Get("chart")
  async handle(
    @Param("studentId") studentId: string,
    @Query() query: Record<string, string>,
    @CurrentUser() user: IAccessToken,
  ) {
    return this.getChartDataUseCase.execute(studentId, query, user.personalId!);
  }
}
