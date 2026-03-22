import { Controller, Patch, HttpCode, HttpStatus, Param, Body } from "@nestjs/common";
import { ApiNotFoundResponse, ApiOkResponse, ApiOperation, ApiTags } from "@nestjs/swagger";

import { API_TAGS } from "@shared/constants";
import { CurrentUser, Roles } from "@shared/decorators";
import { ApplicationRoles } from "@shared/enums";
import { IAccessToken } from "@shared/interfaces/accessToken.interface";

import { RescheduleAppointmentUseCase } from "./rescheduleAppointment.useCase";

@ApiTags(API_TAGS.APPOINTMENTS)
@Roles(ApplicationRoles.PERSONAL)
@Controller({ version: "1", path: "appointments" })
export class RescheduleAppointmentController {
  constructor(private readonly rescheduleAppointmentUseCase: RescheduleAppointmentUseCase) { }

  @ApiOperation({ summary: "Reschedule an appointment" })
  @ApiOkResponse()
  @ApiNotFoundResponse({ description: "Appointment not found" })
  @HttpCode(HttpStatus.OK)
  @Patch(":id/reschedule")
  async handle(
    @Param("id") id: string,
    @Body() body: Record<string, unknown>,
    @CurrentUser() user: IAccessToken,
  ) {
    return this.rescheduleAppointmentUseCase.execute(id, body, user.personalId!);
  }
}
