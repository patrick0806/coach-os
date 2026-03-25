import { Controller, Get, HttpCode, HttpStatus, Query } from "@nestjs/common";
import { ApiOkResponse, ApiOperation, ApiTags } from "@nestjs/swagger";

import { API_TAGS } from "@shared/constants";
import { CurrentUser, Roles } from "@shared/decorators";
import { ApplicationRoles } from "@shared/enums";
import { IAccessToken } from "@shared/interfaces/accessToken.interface";

import { GetAvailabilityUseCase } from "./getAvailability.useCase";

@ApiTags(API_TAGS.CALENDAR)
@Roles(ApplicationRoles.PERSONAL)
@Controller({ version: "2", path: "availability" })
export class GetAvailabilityController {
  constructor(
    private readonly getAvailabilityUseCase: GetAvailabilityUseCase,
  ) { }

  @ApiOperation({ summary: "Get available time slots for a date range" })
  @ApiOkResponse({ description: "Available time slots" })
  @HttpCode(HttpStatus.OK)
  @Get()
  async handle(
    @Query() query: Record<string, string>,
    @CurrentUser() user: IAccessToken,
  ) {
    return this.getAvailabilityUseCase.execute(query, user.personalId!);
  }
}
