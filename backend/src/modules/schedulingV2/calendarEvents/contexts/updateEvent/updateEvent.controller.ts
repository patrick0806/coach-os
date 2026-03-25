import { Body, Controller, HttpCode, HttpStatus, Param, Patch } from "@nestjs/common";
import {
  ApiConflictResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from "@nestjs/swagger";

import { API_TAGS } from "@shared/constants";
import { CurrentUser, Roles } from "@shared/decorators";
import { ApplicationRoles } from "@shared/enums";
import { IAccessToken } from "@shared/interfaces/accessToken.interface";

import { UpdateEventRequestDTO } from "./dtos/request.dto";
import { UpdateEventResponseDTO } from "./dtos/response.dto";
import { UpdateEventUseCase } from "./updateEvent.useCase";

@ApiTags(API_TAGS.CALENDAR_EVENTS)
@Roles(ApplicationRoles.PERSONAL)
@Controller({ version: "1", path: "events" })
export class UpdateEventController {
  constructor(
    private readonly updateEventUseCase: UpdateEventUseCase,
  ) {}

  @ApiOperation({ summary: "Update a calendar event" })
  @ApiOkResponse({ type: UpdateEventResponseDTO })
  @ApiNotFoundResponse({ description: "Event not found" })
  @ApiConflictResponse({ description: "Schedule conflicts detected" })
  @HttpCode(HttpStatus.OK)
  @Patch(":id")
  async handle(
    @Param("id") id: string,
    @Body() body: UpdateEventRequestDTO,
    @CurrentUser() user: IAccessToken,
  ) {
    return this.updateEventUseCase.execute(id, body, user.personalId!);
  }
}
