import { Controller, Get, HttpCode, HttpStatus, Query } from "@nestjs/common";
import { ApiOkResponse, ApiOperation, ApiTags } from "@nestjs/swagger";

import { API_TAGS } from "@shared/constants";
import { CurrentUser, Roles } from "@shared/decorators";
import { ApplicationRoles } from "@shared/enums";
import { IAccessToken } from "@shared/interfaces/accessToken.interface";

import { GetMyChartDataUseCase } from "./getMyChartData.useCase";

@ApiTags(API_TAGS.STUDENTS)
@Roles(ApplicationRoles.STUDENT)
@Controller({ version: "1", path: "me/progress-records" })
export class GetMyChartDataController {
  constructor(private readonly getMyChartDataUseCase: GetMyChartDataUseCase) {}

  @ApiOperation({ summary: "Get my progress chart data (student)" })
  @ApiOkResponse()
  @HttpCode(HttpStatus.OK)
  @Get("chart")
  async handle(
    @Query() query: Record<string, string>,
    @CurrentUser() user: IAccessToken,
  ) {
    return this.getMyChartDataUseCase.execute(
      user.profileId,
      user.personalId!,
      query,
    );
  }
}
