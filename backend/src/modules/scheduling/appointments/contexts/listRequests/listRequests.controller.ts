import { Controller, Get, HttpCode, HttpStatus, Query } from "@nestjs/common";
import { ApiOkResponse, ApiOperation, ApiTags } from "@nestjs/swagger";

import { API_TAGS } from "@shared/constants";
import { CurrentUser, Roles } from "@shared/decorators";
import { ApplicationRoles } from "@shared/enums";
import { IAccessToken } from "@shared/interfaces/accessToken.interface";

import { ListAppointmentRequestsUseCase } from "./listRequests.useCase";

@ApiTags(API_TAGS.BOOKINGS)
@Roles(ApplicationRoles.PERSONAL)
@Controller({ version: "1", path: "appointment-requests" })
export class ListAppointmentRequestsController {
  constructor(
    private readonly listAppointmentRequestsUseCase: ListAppointmentRequestsUseCase,
  ) {}

  @ApiOperation({ summary: "List appointment requests" })
  @ApiOkResponse()
  @HttpCode(HttpStatus.OK)
  @Get()
  async handle(
    @Query() query: Record<string, string>,
    @CurrentUser() user: IAccessToken,
  ) {
    return this.listAppointmentRequestsUseCase.execute(
      query,
      user.personalId!,
    );
  }
}
