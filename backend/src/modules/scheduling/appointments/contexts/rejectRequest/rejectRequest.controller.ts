import { Controller, HttpCode, HttpStatus, Param, Patch } from "@nestjs/common";
import { ApiNotFoundResponse, ApiOkResponse, ApiOperation, ApiTags } from "@nestjs/swagger";

import { API_TAGS } from "@shared/constants";
import { CurrentUser, Roles } from "@shared/decorators";
import { ApplicationRoles } from "@shared/enums";
import { IAccessToken } from "@shared/interfaces/accessToken.interface";

import { RejectAppointmentRequestUseCase } from "./rejectRequest.useCase";

@ApiTags(API_TAGS.BOOKINGS)
@Roles(ApplicationRoles.PERSONAL)
@Controller({ version: "1", path: "appointment-requests" })
export class RejectAppointmentRequestController {
  constructor(
    private readonly rejectAppointmentRequestUseCase: RejectAppointmentRequestUseCase,
  ) {}

  @ApiOperation({ summary: "Reject an appointment request" })
  @ApiOkResponse()
  @ApiNotFoundResponse({ description: "Appointment request not found" })
  @HttpCode(HttpStatus.OK)
  @Patch(":id/reject")
  async handle(
    @Param("id") id: string,
    @CurrentUser() user: IAccessToken,
  ) {
    return this.rejectAppointmentRequestUseCase.execute(id, user.personalId!);
  }
}
