import { Controller, Delete, HttpCode, HttpStatus, Param } from "@nestjs/common";
import { ApiNoContentResponse, ApiOperation, ApiTags } from "@nestjs/swagger";

import { API_TAGS } from "@shared/constants";
import { CurrentUser, Roles } from "@shared/decorators";
import { ApplicationRoles } from "@shared/enums";
import { IAccessToken } from "@shared/interfaces/accessToken.interface";

import { DeleteNoteUseCase } from "./deleteNote.useCase";

@ApiTags(API_TAGS.NOTES)
@Roles(ApplicationRoles.PERSONAL)
@Controller({ version: "1", path: "notes" })
export class DeleteNoteController {
  constructor(private readonly deleteNoteUseCase: DeleteNoteUseCase) {}

  @ApiOperation({ summary: "Delete a student note" })
  @ApiNoContentResponse()
  @HttpCode(HttpStatus.NO_CONTENT)
  @Delete(":id")
  async handle(@Param("id") id: string, @CurrentUser() user: IAccessToken) {
    await this.deleteNoteUseCase.execute(id, user.personalId!);
  }
}
