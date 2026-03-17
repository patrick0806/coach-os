import { Body, Controller, HttpCode, HttpStatus, Param, Patch } from "@nestjs/common";
import { ApiNotFoundResponse, ApiOkResponse, ApiOperation, ApiTags } from "@nestjs/swagger";

import { API_TAGS } from "@shared/constants";
import { CurrentUser, Roles } from "@shared/decorators";
import { ApplicationRoles } from "@shared/enums";
import { IAccessToken } from "@shared/interfaces/accessToken.interface";

import { CancelAppointmentUseCase } from "./cancelAppointment.useCase";

@ApiTags(API_TAGS.BOOKINGS)
@Roles(ApplicationRoles.PERSONAL, ApplicationRoles.STUDENT)
@Controller({ version: "1", path: "appointments" })
export class CancelAppointmentController {
  constructor(
    private readonly cancelAppointmentUseCase: CancelAppointmentUseCase,
  ) {}

  @ApiOperation({ summary: "Cancel an appointment" })
  @ApiOkResponse()
  @ApiNotFoundResponse({ description: "Appointment not found" })
  @HttpCode(HttpStatus.OK)
  @Patch(":id/cancel")
  async handle(
    @Param("id") id: string,
    @Body() body: Record<string, unknown>,
    @CurrentUser() user: IAccessToken,
  ) {
    return this.cancelAppointmentUseCase.execute(id, body, user.personalId!);
  }
}
