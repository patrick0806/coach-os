import { Body, Controller, Post } from "@nestjs/common";
import { ApiCreatedResponse, ApiOperation, ApiTags } from "@nestjs/swagger";

import { CurrentUser, Roles } from "@shared/decorators";
import { ApplicationRoles } from "@shared/enums";
import { IAccessToken } from "@shared/interfaces";
import { API_TAGS } from "@shared/constants";

import { StartSessionService } from "./start-session.service";
import { StartSessionDTO } from "./dtos/request.dto";

@Roles(ApplicationRoles.STUDENT)
@ApiTags(API_TAGS.STUDENTS)
@Controller({ version: "1", path: "workout-sessions" })
export class StartSessionController {
  constructor(private readonly startSessionService: StartSessionService) {}

  @Post("start")
  @ApiOperation({ summary: "Start or resume an active workout session" })
  @ApiCreatedResponse({ description: "Session started or resumed" })
  handle(
    @Body() body: StartSessionDTO,
    @CurrentUser() currentUser: IAccessToken,
  ) {
    return this.startSessionService.execute(body, currentUser);
  }
}
