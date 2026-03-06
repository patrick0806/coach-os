import { Controller, Delete, HttpCode, HttpStatus, Param } from "@nestjs/common";
import { ApiNoContentResponse, ApiOperation, ApiTags } from "@nestjs/swagger";

import { CurrentUser, Roles } from "@shared/decorators";
import { ApplicationRoles } from "@shared/enums";
import { IAccessToken } from "@shared/interfaces";
import { API_TAGS } from "@shared/constants";

import { RevokeStudentService } from "./revoke-student.service";

@Roles(ApplicationRoles.PERSONAL)
@ApiTags(API_TAGS.WORKOUT_PLANS)
@Controller({ version: "1", path: ":id/students" })
export class RevokeStudentController {
  constructor(private readonly revokeStudentService: RevokeStudentService) {}

  @Delete(":studentId")
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: "Revoke a student assignment from a workout plan" })
  @ApiNoContentResponse()
  handle(
    @Param("id") planId: string,
    @Param("studentId") studentId: string,
    @CurrentUser() user: IAccessToken,
  ): Promise<void> {
    return this.revokeStudentService.execute(planId, studentId, user);
  }
}
