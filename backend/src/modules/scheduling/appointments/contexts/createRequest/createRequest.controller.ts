import { Body, Controller, HttpCode, HttpStatus, Post } from "@nestjs/common";
import { ApiCreatedResponse, ApiOperation, ApiTags } from "@nestjs/swagger";

import { API_TAGS } from "@shared/constants";
import { CurrentUser, Roles } from "@shared/decorators";
import { ApplicationRoles } from "@shared/enums";
import { IAccessToken } from "@shared/interfaces/accessToken.interface";

import { CreateAppointmentRequestRequestDTO } from "./dtos/request.dto";
import { CreateAppointmentRequestResponseDTO } from "./dtos/response.dto";
import { CreateAppointmentRequestUseCase } from "./createRequest.useCase";

@ApiTags(API_TAGS.BOOKINGS)
@Roles(ApplicationRoles.STUDENT)
@Controller({ version: "1", path: "appointment-requests" })
export class CreateAppointmentRequestController {
  constructor(
    private readonly createAppointmentRequestUseCase: CreateAppointmentRequestUseCase,
  ) {}

  @ApiOperation({ summary: "Request an appointment" })
  @ApiCreatedResponse({ type: CreateAppointmentRequestResponseDTO })
  @HttpCode(HttpStatus.CREATED)
  @Post()
  async handle(
    @Body() body: CreateAppointmentRequestRequestDTO,
    @CurrentUser() user: IAccessToken,
  ) {
    return this.createAppointmentRequestUseCase.execute(
      body,
      user.profileId,
      user.personalId!,
    );
  }
}
