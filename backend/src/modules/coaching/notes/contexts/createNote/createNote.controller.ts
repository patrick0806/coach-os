import { Body, Controller, HttpCode, HttpStatus, Param, Post } from "@nestjs/common";
import { ApiCreatedResponse, ApiOperation, ApiTags } from "@nestjs/swagger";

import { API_TAGS } from "@shared/constants";
import { CurrentUser, Roles } from "@shared/decorators";
import { ApplicationRoles } from "@shared/enums";
import { IAccessToken } from "@shared/interfaces/accessToken.interface";

import { CreateNoteRequestDTO } from "./dtos/request.dto";
import { CreateNoteResponseDTO } from "./dtos/response.dto";
import { CreateNoteUseCase } from "./createNote.useCase";

@ApiTags(API_TAGS.NOTES)
@Roles(ApplicationRoles.PERSONAL)
@Controller({ version: "1", path: "students/:studentId/notes" })
export class CreateNoteController {
  constructor(private readonly createNoteUseCase: CreateNoteUseCase) {}

  @ApiOperation({ summary: "Create a note for a student" })
  @ApiCreatedResponse({ type: CreateNoteResponseDTO })
  @HttpCode(HttpStatus.CREATED)
  @Post()
  async handle(
    @Param("studentId") studentId: string,
    @Body() body: CreateNoteRequestDTO,
    @CurrentUser() user: IAccessToken,
  ) {
    return this.createNoteUseCase.execute(studentId, body, user.personalId!);
  }
}
