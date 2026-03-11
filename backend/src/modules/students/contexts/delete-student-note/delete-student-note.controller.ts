import { Controller, Delete, HttpCode, HttpStatus, Param } from "@nestjs/common";
import { ApiNoContentResponse, ApiOperation, ApiTags } from "@nestjs/swagger";

import { API_TAGS } from "@shared/constants";
import { CurrentUser, Roles } from "@shared/decorators";
import { ApplicationRoles } from "@shared/enums";
import { IAccessToken } from "@shared/interfaces";

import { DeleteStudentNoteService } from "./delete-student-note.service";

@Roles(ApplicationRoles.PERSONAL)
@ApiTags(API_TAGS.STUDENTS)
@Controller({ version: "1", path: "notes" })
export class DeleteStudentNoteController {
  constructor(private readonly deleteStudentNoteService: DeleteStudentNoteService) {}

  @Delete(":noteId")
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: "Delete a private student note" })
  @ApiNoContentResponse()
  handle(
    @Param("noteId") noteId: string,
    @CurrentUser() user: IAccessToken,
  ): Promise<void> {
    return this.deleteStudentNoteService.execute(noteId, user);
  }
}
