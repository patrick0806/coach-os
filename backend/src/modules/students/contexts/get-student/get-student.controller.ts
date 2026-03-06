import { Controller, Get, Param } from "@nestjs/common";
import { ApiOkResponse, ApiOperation, ApiTags } from "@nestjs/swagger";

import { CurrentUser, Roles } from "@shared/decorators";
import { ApplicationRoles } from "@shared/enums";
import { IAccessToken } from "@shared/interfaces";
import { API_TAGS } from "@shared/constants";

import { GetStudentService } from "./get-student.service";
import { GetStudentResponseDTO } from "./dtos/response.dto";

@Roles(ApplicationRoles.PERSONAL)
@ApiTags(API_TAGS.STUDENTS)
@Controller({ version: "1", path: "" })
export class GetStudentController {
  constructor(private readonly getStudentService: GetStudentService) {}

  @Get(":id")
  @ApiOperation({ summary: "Get a student by ID (tenant-scoped)" })
  @ApiOkResponse({ type: GetStudentResponseDTO })
  handle(
    @Param("id") id: string,
    @CurrentUser() user: IAccessToken,
  ): Promise<GetStudentResponseDTO> {
    return this.getStudentService.execute(id, user);
  }
}
