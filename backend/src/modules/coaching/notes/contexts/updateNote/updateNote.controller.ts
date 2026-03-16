import { Body, Controller, Param, Put } from "@nestjs/common";
import { ApiOkResponse, ApiOperation, ApiTags } from "@nestjs/swagger";

import { API_TAGS } from "@shared/constants";
import { CurrentUser, Roles } from "@shared/decorators";
import { ApplicationRoles } from "@shared/enums";
import { IAccessToken } from "@shared/interfaces/accessToken.interface";

import { UpdateNoteRequestDTO } from "./dtos/request.dto";
import { UpdateNoteUseCase } from "./updateNote.useCase";

@ApiTags(API_TAGS.NOTES)
@Roles(ApplicationRoles.PERSONAL)
@Controller({ version: "1", path: "notes" })
export class UpdateNoteController {
  constructor(private readonly updateNoteUseCase: UpdateNoteUseCase) {}

  @ApiOperation({ summary: "Update a student note" })
  @ApiOkResponse()
  @Put(":id")
  async handle(
    @Param("id") id: string,
    @Body() body: UpdateNoteRequestDTO,
    @CurrentUser() user: IAccessToken,
  ) {
    return this.updateNoteUseCase.execute(id, body, user.personalId!);
  }
}
