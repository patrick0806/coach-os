import { Body, Controller, HttpCode, HttpStatus, Param, Post } from "@nestjs/common";
import { ApiCreatedResponse, ApiOperation, ApiTags } from "@nestjs/swagger";

import { API_TAGS } from "@shared/constants";
import { CurrentUser, Roles } from "@shared/decorators";
import { ApplicationRoles } from "@shared/enums";
import { IAccessToken } from "@shared/interfaces";

import { CreateStudentNoteService } from "./create-student-note.service";
import { CreateStudentNoteDTO } from "./dtos/request.dto";
import { StudentNoteResponseDTO } from "./dtos/response.dto";

@Roles(ApplicationRoles.PERSONAL)
@ApiTags(API_TAGS.STUDENTS)
@Controller({ version: "1", path: "" })
export class CreateStudentNoteController {
  constructor(private readonly createStudentNoteService: CreateStudentNoteService) {}

  @Post(":id/notes")
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: "Create a private note for a student" })
  @ApiCreatedResponse({ type: StudentNoteResponseDTO })
  handle(
    @Param("id") studentId: string,
    @Body() dto: CreateStudentNoteDTO,
    @CurrentUser() user: IAccessToken,
  ): Promise<StudentNoteResponseDTO> {
    return this.createStudentNoteService.execute(studentId, dto, user);
  }
}
