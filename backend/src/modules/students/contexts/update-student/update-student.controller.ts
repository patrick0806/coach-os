import { Body, Controller, Param, Patch } from "@nestjs/common";
import { ApiOkResponse, ApiOperation, ApiTags } from "@nestjs/swagger";

import { CurrentUser, Roles } from "@shared/decorators";
import { ApplicationRoles } from "@shared/enums";
import { IAccessToken } from "@shared/interfaces";
import { API_TAGS } from "@shared/constants";

import { UpdateStudentService } from "./update-student.service";
import { UpdateStudentDTO } from "./dtos/request.dto";
import { UpdateStudentResponseDTO } from "./dtos/response.dto";

@Roles(ApplicationRoles.PERSONAL)
@ApiTags(API_TAGS.STUDENTS)
@Controller({ version: "1", path: "" })
export class UpdateStudentController {
  constructor(private readonly updateStudentService: UpdateStudentService) {}

  @Patch(":id")
  @ApiOperation({ summary: "Update a student name or email (tenant-scoped)" })
  @ApiOkResponse({ type: UpdateStudentResponseDTO })
  handle(
    @Param("id") id: string,
    @Body() dto: UpdateStudentDTO,
    @CurrentUser() user: IAccessToken,
  ): Promise<UpdateStudentResponseDTO> {
    return this.updateStudentService.execute(id, dto, user);
  }
}
