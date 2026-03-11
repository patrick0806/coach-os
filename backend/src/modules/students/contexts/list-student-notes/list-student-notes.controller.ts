import { Controller, Get, Param, Query } from "@nestjs/common";
import { ApiOkResponse, ApiOperation, ApiTags } from "@nestjs/swagger";

import { API_TAGS } from "@shared/constants";
import { CurrentUser, Roles } from "@shared/decorators";
import { ApplicationRoles } from "@shared/enums";
import { IAccessToken } from "@shared/interfaces";

import { ListStudentNotesService } from "./list-student-notes.service";
import { ListStudentNotesQueryDTO } from "./dtos/request.dto";
import { PaginatedStudentNotesResponseDTO } from "./dtos/response.dto";

@Roles(ApplicationRoles.PERSONAL)
@ApiTags(API_TAGS.STUDENTS)
@Controller({ version: "1", path: "" })
export class ListStudentNotesController {
  constructor(private readonly listStudentNotesService: ListStudentNotesService) {}

  @Get(":id/notes")
  @ApiOperation({ summary: "List private notes for a student" })
  @ApiOkResponse({ type: PaginatedStudentNotesResponseDTO })
  handle(
    @Param("id") studentId: string,
    @Query() query: ListStudentNotesQueryDTO,
    @CurrentUser() user: IAccessToken,
  ): Promise<PaginatedStudentNotesResponseDTO> {
    return this.listStudentNotesService.execute(studentId, query, user);
  }
}
