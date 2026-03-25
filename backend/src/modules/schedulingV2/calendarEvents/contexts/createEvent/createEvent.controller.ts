import { Body, Controller, HttpCode, HttpStatus, Post } from "@nestjs/common";
import {
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiOperation,
  ApiTags,
} from "@nestjs/swagger";

import { API_TAGS } from "@shared/constants";
import { CurrentUser, Roles } from "@shared/decorators";
import { ApplicationRoles } from "@shared/enums";
import { IAccessToken } from "@shared/interfaces/accessToken.interface";

import { CreateEventRequestDTO } from "./dtos/request.dto";
import { CreateEventResponseDTO } from "./dtos/response.dto";
import { CreateEventUseCase } from "./createEvent.useCase";

@ApiTags(API_TAGS.CALENDAR_EVENTS)
@Roles(ApplicationRoles.PERSONAL)
@Controller({ version: "1", path: "events" })
export class CreateEventController {
  constructor(
    private readonly createEventUseCase: CreateEventUseCase,
  ) {}

  @ApiOperation({ summary: "Create a calendar event" })
  @ApiCreatedResponse({ type: CreateEventResponseDTO })
  @ApiConflictResponse({ description: "Schedule conflicts detected" })
  @HttpCode(HttpStatus.CREATED)
  @Post()
  async handle(
    @Body() body: CreateEventRequestDTO,
    @CurrentUser() user: IAccessToken,
  ) {
    return this.createEventUseCase.execute(body, user.personalId!);
  }
}
