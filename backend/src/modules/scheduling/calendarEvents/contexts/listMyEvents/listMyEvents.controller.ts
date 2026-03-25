import { Controller, Get, HttpCode, HttpStatus, Query } from "@nestjs/common";
import { ApiOkResponse, ApiOperation, ApiTags } from "@nestjs/swagger";

import { API_TAGS } from "@shared/constants";
import { CurrentUser, Roles } from "@shared/decorators";
import { ApplicationRoles } from "@shared/enums";
import { IAccessToken } from "@shared/interfaces/accessToken.interface";

import { ListMyEventsUseCase } from "./listMyEvents.useCase";

@ApiTags(API_TAGS.CALENDAR_EVENTS)
@Roles(ApplicationRoles.STUDENT)
@Controller({ version: "1", path: "me/events" })
export class ListMyEventsController {
  constructor(
    private readonly listMyEventsUseCase: ListMyEventsUseCase,
  ) {}

  @ApiOperation({ summary: "List my events (student portal)" })
  @ApiOkResponse()
  @HttpCode(HttpStatus.OK)
  @Get()
  async handle(
    @Query() query: Record<string, string>,
    @CurrentUser() user: IAccessToken,
  ) {
    return this.listMyEventsUseCase.execute(
      user.profileId!,
      user.personalId!,
      query,
    );
  }
}
