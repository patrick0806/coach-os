import { Controller, Delete, HttpCode, HttpStatus, Param } from "@nestjs/common";
import { ApiNoContentResponse, ApiOperation, ApiTags } from "@nestjs/swagger";

import { CurrentUser, Roles } from "@shared/decorators";
import { ApplicationRoles } from "@shared/enums";
import { IAccessToken } from "@shared/interfaces";
import { API_TAGS } from "@shared/constants";

import { DeactivateStudentService } from "./deactivate-student.service";

@Roles(ApplicationRoles.PERSONAL)
@ApiTags(API_TAGS.STUDENTS)
@Controller({ version: "1", path: "" })
export class DeactivateStudentController {
  constructor(
    private readonly deactivateStudentService: DeactivateStudentService,
  ) {}

  @Delete(":id")
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: "Deactivate a student (soft delete, tenant-scoped)" })
  @ApiNoContentResponse()
  async handle(
    @Param("id") id: string,
    @CurrentUser() user: IAccessToken,
  ): Promise<void> {
    await this.deactivateStudentService.execute(id, user);
  }
}
