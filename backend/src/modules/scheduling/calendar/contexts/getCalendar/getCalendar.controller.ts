import { Controller, Get, HttpCode, HttpStatus, Query } from "@nestjs/common";
import { ApiOkResponse, ApiOperation, ApiTags } from "@nestjs/swagger";

import { API_TAGS } from "@shared/constants";
import { CurrentUser, Roles } from "@shared/decorators";
import { ApplicationRoles } from "@shared/enums";
import { IAccessToken } from "@shared/interfaces/accessToken.interface";

import { GetCalendarUseCase } from "./getCalendar.useCase";

@ApiTags(API_TAGS.CALENDAR)
@Roles(ApplicationRoles.PERSONAL)
@Controller({ version: "1", path: "" })
export class GetCalendarController {
  constructor(private readonly getCalendarUseCase: GetCalendarUseCase) { }

  @ApiOperation({ summary: "Get unified calendar view" })
  @ApiOkResponse()
  @HttpCode(HttpStatus.OK)
  @Get()
  async handle(
    @Query() query: Record<string, string>,
    @CurrentUser() user: IAccessToken,
  ) {
    return this.getCalendarUseCase.execute(query, user.personalId!);
  }
}
