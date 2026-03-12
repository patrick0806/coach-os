import { Controller, Param, Post } from "@nestjs/common";
import { ApiOkResponse, ApiOperation, ApiTags } from "@nestjs/swagger";

import { CurrentUser, Roles } from "@shared/decorators";
import { ApplicationRoles } from "@shared/enums";
import { IAccessToken } from "@shared/interfaces";
import { API_TAGS } from "@shared/constants";

import { CompleteSessionService } from "./complete-session.service";

@Roles(ApplicationRoles.STUDENT)
@ApiTags(API_TAGS.STUDENTS)
@Controller({ version: "1", path: "workout-sessions" })
export class CompleteSessionController {
  constructor(private readonly completeSessionService: CompleteSessionService) {}

  @Post(":id/complete")
  @ApiOperation({ summary: "Complete a workout session" })
  @ApiOkResponse({ description: "Session completed" })
  handle(@Param("id") sessionId: string, @CurrentUser() currentUser: IAccessToken) {
    return this.completeSessionService.execute(sessionId, currentUser);
  }
}
