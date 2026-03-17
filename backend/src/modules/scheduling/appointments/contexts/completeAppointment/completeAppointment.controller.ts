import { Controller, HttpCode, HttpStatus, Param, Patch } from "@nestjs/common";
import { ApiNotFoundResponse, ApiOkResponse, ApiOperation, ApiTags } from "@nestjs/swagger";

import { API_TAGS } from "@shared/constants";
import { CurrentUser, Roles } from "@shared/decorators";
import { ApplicationRoles } from "@shared/enums";
import { IAccessToken } from "@shared/interfaces/accessToken.interface";

import { CompleteAppointmentUseCase } from "./completeAppointment.useCase";

@ApiTags(API_TAGS.BOOKINGS)
@Roles(ApplicationRoles.PERSONAL)
@Controller({ version: "1", path: "appointments" })
export class CompleteAppointmentController {
  constructor(
    private readonly completeAppointmentUseCase: CompleteAppointmentUseCase,
  ) {}

  @ApiOperation({ summary: "Mark an appointment as completed" })
  @ApiOkResponse()
  @ApiNotFoundResponse({ description: "Appointment not found" })
  @HttpCode(HttpStatus.OK)
  @Patch(":id/complete")
  async handle(
    @Param("id") id: string,
    @CurrentUser() user: IAccessToken,
  ) {
    return this.completeAppointmentUseCase.execute(id, user.personalId!);
  }
}
