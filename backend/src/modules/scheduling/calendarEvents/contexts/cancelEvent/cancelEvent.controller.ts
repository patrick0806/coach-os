import { Body, Controller, HttpCode, HttpStatus, Param, Patch } from "@nestjs/common";
import { ApiNotFoundResponse, ApiOkResponse, ApiOperation, ApiTags } from "@nestjs/swagger";

import { API_TAGS } from "@shared/constants";
import { CurrentUser, Roles } from "@shared/decorators";
import { ApplicationRoles } from "@shared/enums";
import { IAccessToken } from "@shared/interfaces/accessToken.interface";

import { CancelEventRequestDTO } from "./dtos/request.dto";
import { CancelEventUseCase } from "./cancelEvent.useCase";

@ApiTags(API_TAGS.CALENDAR_EVENTS)
@Roles(ApplicationRoles.PERSONAL)
@Controller({ version: "1", path: "events" })
export class CancelEventController {
  constructor(
    private readonly cancelEventUseCase: CancelEventUseCase,
  ) {}

  @ApiOperation({ summary: "Cancel a calendar event" })
  @ApiOkResponse()
  @ApiNotFoundResponse({ description: "Event not found" })
  @HttpCode(HttpStatus.OK)
  @Patch(":id/cancel")
  async handle(
    @Param("id") id: string,
    @Body() body: CancelEventRequestDTO,
    @CurrentUser() user: IAccessToken,
  ) {
    return this.cancelEventUseCase.execute(id, body, user.personalId!);
  }
}
