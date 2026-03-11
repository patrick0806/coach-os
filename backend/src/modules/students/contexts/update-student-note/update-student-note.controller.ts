import { Body, Controller, Param, Patch } from "@nestjs/common";
import { ApiOkResponse, ApiOperation, ApiTags } from "@nestjs/swagger";

import { API_TAGS } from "@shared/constants";
import { CurrentUser, Roles } from "@shared/decorators";
import { ApplicationRoles } from "@shared/enums";
import { IAccessToken } from "@shared/interfaces";

import { UpdateStudentNoteService } from "./update-student-note.service";
import { UpdateStudentNoteDTO } from "./dtos/request.dto";
import { StudentNoteResponseDTO } from "../create-student-note/dtos/response.dto";

@Roles(ApplicationRoles.PERSONAL)
@ApiTags(API_TAGS.STUDENTS)
@Controller({ version: "1", path: "notes" })
export class UpdateStudentNoteController {
  constructor(private readonly updateStudentNoteService: UpdateStudentNoteService) {}

  @Patch(":noteId")
  @ApiOperation({ summary: "Update a private student note" })
  @ApiOkResponse({ type: StudentNoteResponseDTO })
  handle(
    @Param("noteId") noteId: string,
    @Body() dto: UpdateStudentNoteDTO,
    @CurrentUser() user: IAccessToken,
  ): Promise<StudentNoteResponseDTO> {
    return this.updateStudentNoteService.execute(noteId, dto, user);
  }
}
