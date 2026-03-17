import { Body, Controller, HttpCode, HttpStatus, Param, Patch } from "@nestjs/common";
import { ApiNotFoundResponse, ApiOkResponse, ApiOperation, ApiTags } from "@nestjs/swagger";

import { API_TAGS } from "@shared/constants";
import { CurrentUser, Roles } from "@shared/decorators";
import { ApplicationRoles } from "@shared/enums";
import { IAccessToken } from "@shared/interfaces/accessToken.interface";

import { ApproveAppointmentRequestUseCase } from "./approveRequest.useCase";

@ApiTags(API_TAGS.BOOKINGS)
@Roles(ApplicationRoles.PERSONAL)
@Controller({ version: "1", path: "appointment-requests" })
export class ApproveAppointmentRequestController {
  constructor(
    private readonly approveAppointmentRequestUseCase: ApproveAppointmentRequestUseCase,
  ) {}

  @ApiOperation({ summary: "Approve an appointment request" })
  @ApiOkResponse()
  @ApiNotFoundResponse({ description: "Appointment request not found" })
  @HttpCode(HttpStatus.OK)
  @Patch(":id/approve")
  async handle(
    @Param("id") id: string,
    @Body() body: Record<string, unknown>,
    @CurrentUser() user: IAccessToken,
  ) {
    return this.approveAppointmentRequestUseCase.execute(
      id,
      body,
      user.personalId!,
    );
  }
}
