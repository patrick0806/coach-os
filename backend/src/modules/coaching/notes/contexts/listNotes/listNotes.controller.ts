import { Controller, Get, Param } from "@nestjs/common";
import { ApiOkResponse, ApiOperation, ApiTags } from "@nestjs/swagger";

import { API_TAGS } from "@shared/constants";
import { CurrentUser, Roles } from "@shared/decorators";
import { ApplicationRoles } from "@shared/enums";
import { IAccessToken } from "@shared/interfaces/accessToken.interface";

import { NoteResponseDTO } from "./dtos/response.dto";
import { ListNotesUseCase } from "./listNotes.useCase";

@ApiTags(API_TAGS.NOTES)
@Roles(ApplicationRoles.PERSONAL)
@Controller({ version: "1", path: "students/:studentId/notes" })
export class ListNotesController {
  constructor(private readonly listNotesUseCase: ListNotesUseCase) {}

  @ApiOperation({ summary: "List notes for a student" })
  @ApiOkResponse({ type: [NoteResponseDTO] })
  @Get()
  async handle(@Param("studentId") studentId: string, @CurrentUser() user: IAccessToken) {
    return this.listNotesUseCase.execute(studentId, user.personalId!);
  }
}
