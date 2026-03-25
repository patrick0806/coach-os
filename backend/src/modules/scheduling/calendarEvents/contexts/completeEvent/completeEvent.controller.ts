import { Controller, HttpCode, HttpStatus, Param, Patch } from "@nestjs/common";
import { ApiNotFoundResponse, ApiOkResponse, ApiOperation, ApiTags } from "@nestjs/swagger";

import { API_TAGS } from "@shared/constants";
import { CurrentUser, Roles } from "@shared/decorators";
import { ApplicationRoles } from "@shared/enums";
import { IAccessToken } from "@shared/interfaces/accessToken.interface";

import { CompleteEventUseCase } from "./completeEvent.useCase";

@ApiTags(API_TAGS.CALENDAR_EVENTS)
@Roles(ApplicationRoles.PERSONAL)
@Controller({ version: "1", path: "events" })
export class CompleteEventController {
  constructor(
    private readonly completeEventUseCase: CompleteEventUseCase,
  ) {}

  @ApiOperation({ summary: "Mark a calendar event as completed" })
  @ApiOkResponse()
  @ApiNotFoundResponse({ description: "Event not found" })
  @HttpCode(HttpStatus.OK)
  @Patch(":id/complete")
  async handle(
    @Param("id") id: string,
    @CurrentUser() user: IAccessToken,
  ) {
    return this.completeEventUseCase.execute(id, user.personalId!);
  }
}
