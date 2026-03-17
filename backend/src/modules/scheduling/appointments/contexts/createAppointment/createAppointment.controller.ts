import { Body, Controller, HttpCode, HttpStatus, Post } from "@nestjs/common";
import {
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiOperation,
  ApiTags,
} from "@nestjs/swagger";

import { API_TAGS } from "@shared/constants";
import { CurrentUser, Roles } from "@shared/decorators";
import { ApplicationRoles } from "@shared/enums";
import { IAccessToken } from "@shared/interfaces/accessToken.interface";

import { CreateAppointmentRequestDTO } from "./dtos/request.dto";
import { CreateAppointmentResponseDTO } from "./dtos/response.dto";
import { CreateAppointmentUseCase } from "./createAppointment.useCase";

@ApiTags(API_TAGS.BOOKINGS)
@Roles(ApplicationRoles.PERSONAL)
@Controller({ version: "1", path: "appointments" })
export class CreateAppointmentController {
  constructor(
    private readonly createAppointmentUseCase: CreateAppointmentUseCase,
  ) {}

  @ApiOperation({ summary: "Create an appointment" })
  @ApiCreatedResponse({ type: CreateAppointmentResponseDTO })
  @ApiNotFoundResponse({ description: "Student not found" })
  @ApiConflictResponse({ description: "Schedule conflicts detected" })
  @HttpCode(HttpStatus.CREATED)
  @Post()
  async handle(
    @Body() body: CreateAppointmentRequestDTO,
    @CurrentUser() user: IAccessToken,
  ) {
    return this.createAppointmentUseCase.execute(body, user.personalId!);
  }
}
