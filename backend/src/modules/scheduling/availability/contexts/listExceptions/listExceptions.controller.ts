import { Controller, Get, HttpCode, HttpStatus, Query } from "@nestjs/common";
import { ApiOkResponse, ApiOperation, ApiTags } from "@nestjs/swagger";

import { API_TAGS } from "@shared/constants";
import { CurrentUser, Roles } from "@shared/decorators";
import { ApplicationRoles } from "@shared/enums";
import { IAccessToken } from "@shared/interfaces/accessToken.interface";

import { ListAvailabilityExceptionsUseCase } from "./listExceptions.useCase";

@ApiTags(API_TAGS.AVAILABILITY)
@Roles(ApplicationRoles.PERSONAL)
@Controller({ version: "1", path: "availability-exceptions" })
export class ListAvailabilityExceptionsController {
  constructor(
    private readonly listAvailabilityExceptionsUseCase: ListAvailabilityExceptionsUseCase,
  ) {}

  @ApiOperation({ summary: "List availability exceptions" })
  @ApiOkResponse()
  @HttpCode(HttpStatus.OK)
  @Get()
  async handle(
    @Query() query: Record<string, string>,
    @CurrentUser() user: IAccessToken,
  ) {
    return this.listAvailabilityExceptionsUseCase.execute(
      query,
      user.personalId!,
    );
  }
}
