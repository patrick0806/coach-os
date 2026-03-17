import { Controller, Get, HttpCode, HttpStatus, Param } from "@nestjs/common";
import { ApiNotFoundResponse, ApiOkResponse, ApiOperation, ApiTags } from "@nestjs/swagger";

import { API_TAGS } from "@shared/constants";
import { CurrentUser, Roles } from "@shared/decorators";
import { ApplicationRoles } from "@shared/enums";
import { IAccessToken } from "@shared/interfaces/accessToken.interface";

import { GetAppointmentUseCase } from "./getAppointment.useCase";

@ApiTags(API_TAGS.BOOKINGS)
@Roles(ApplicationRoles.PERSONAL, ApplicationRoles.STUDENT)
@Controller({ version: "1", path: "appointments" })
export class GetAppointmentController {
  constructor(
    private readonly getAppointmentUseCase: GetAppointmentUseCase,
  ) {}

  @ApiOperation({ summary: "Get an appointment by ID" })
  @ApiOkResponse()
  @ApiNotFoundResponse({ description: "Appointment not found" })
  @HttpCode(HttpStatus.OK)
  @Get(":id")
  async handle(
    @Param("id") id: string,
    @CurrentUser() user: IAccessToken,
  ) {
    return this.getAppointmentUseCase.execute(id, user.personalId!);
  }
}
