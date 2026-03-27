import { Controller, Get, HttpCode, HttpStatus, Query } from "@nestjs/common";
import { ApiOkResponse, ApiOperation, ApiTags } from "@nestjs/swagger";

import { API_TAGS } from "@shared/constants";
import { CurrentUser, Roles } from "@shared/decorators";
import { ApplicationRoles } from "@shared/enums";
import { IAccessToken } from "@shared/interfaces/accessToken.interface";

import { GetMyCalendarUseCase } from "./getMyCalendar.useCase";

@ApiTags(API_TAGS.CALENDAR)
@Roles(ApplicationRoles.STUDENT)
@Controller({ version: "1", path: "me/calendar" })
export class GetMyCalendarController {
  constructor(private readonly getMyCalendarUseCase: GetMyCalendarUseCase) {}

  @ApiOperation({ summary: "Get student unified calendar for a date range" })
  @ApiOkResponse({ description: "Unified calendar entries (recurring + events)" })
  @HttpCode(HttpStatus.OK)
  @Get()
  async handle(
    @Query() query: Record<string, string>,
    @CurrentUser() user: IAccessToken,
  ) {
    return this.getMyCalendarUseCase.execute(
      query,
      user.profileId!,
      user.personalId!,
    );
  }
}
