import { Body, Controller, HttpCode, HttpStatus, Param, Post } from "@nestjs/common";
import { ApiNoContentResponse, ApiOperation, ApiTags } from "@nestjs/swagger";

import { CurrentUser, Roles } from "@shared/decorators";
import { ApplicationRoles } from "@shared/enums";
import { IAccessToken } from "@shared/interfaces";
import { API_TAGS } from "@shared/constants";

import { AssignStudentsService } from "./assign-students.service";
import { AssignStudentsDTO } from "./dtos/request.dto";

@Roles(ApplicationRoles.PERSONAL)
@ApiTags(API_TAGS.WORKOUT_PLANS)
@Controller({ version: "1", path: ":id/students" })
export class AssignStudentsController {
  constructor(private readonly assignStudentsService: AssignStudentsService) {}

  @Post()
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: "Assign one or more students to a workout plan" })
  @ApiNoContentResponse()
  handle(
    @Param("id") planId: string,
    @Body() dto: AssignStudentsDTO,
    @CurrentUser() user: IAccessToken,
  ): Promise<void> {
    return this.assignStudentsService.execute(planId, dto.studentIds, user);
  }
}
