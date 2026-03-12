import { Controller, Get } from "@nestjs/common";
import { ApiOkResponse, ApiOperation, ApiTags } from "@nestjs/swagger";

import { CurrentUser, Roles } from "@shared/decorators";
import { ApplicationRoles } from "@shared/enums";
import { IAccessToken } from "@shared/interfaces";
import { API_TAGS } from "@shared/constants";

import { MyStatsService } from "./my-stats.service";

@Roles(ApplicationRoles.STUDENT)
@ApiTags(API_TAGS.STUDENTS)
@Controller({ version: "1", path: "me/stats" })
export class MyStatsController {
  constructor(private readonly myStatsService: MyStatsService) {}

  @Get()
  @ApiOperation({ summary: "Get gamification stats for the authenticated student" })
  @ApiOkResponse({ description: "Student gamification stats" })
  handle(@CurrentUser() currentUser: IAccessToken) {
    return this.myStatsService.execute(currentUser);
  }
}
