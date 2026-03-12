import { Body, Controller, Param, Patch } from "@nestjs/common";
import { ApiOkResponse, ApiOperation, ApiTags } from "@nestjs/swagger";

import { CurrentUser, Roles } from "@shared/decorators";
import { ApplicationRoles } from "@shared/enums";
import { IAccessToken } from "@shared/interfaces";
import { API_TAGS } from "@shared/constants";

import { UpdateStepService } from "./update-step.service";
import { UpdateStepDTO } from "./dtos/request.dto";

@Roles(ApplicationRoles.STUDENT)
@ApiTags(API_TAGS.STUDENTS)
@Controller({ version: "1", path: "workout-sessions" })
export class UpdateStepController {
  constructor(private readonly updateStepService: UpdateStepService) {}

  @Patch(":id/step")
  @ApiOperation({ summary: "Update current exercise step of a workout session" })
  @ApiOkResponse({ description: "Session step updated" })
  handle(
    @Param("id") sessionId: string,
    @Body() body: UpdateStepDTO,
    @CurrentUser() currentUser: IAccessToken,
  ) {
    return this.updateStepService.execute(sessionId, body, currentUser);
  }
}
