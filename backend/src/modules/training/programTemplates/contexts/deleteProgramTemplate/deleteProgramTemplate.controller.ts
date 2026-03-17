import { Controller, Delete, HttpCode, HttpStatus, Param } from "@nestjs/common";
import { ApiNoContentResponse, ApiOperation, ApiTags } from "@nestjs/swagger";

import { API_TAGS } from "@shared/constants";
import { CurrentUser, Roles } from "@shared/decorators";
import { ApplicationRoles } from "@shared/enums";
import { IAccessToken } from "@shared/interfaces/accessToken.interface";

import { DeleteProgramTemplateUseCase } from "./deleteProgramTemplate.useCase";

@ApiTags(API_TAGS.WORKOUT_PLANS)
@Roles(ApplicationRoles.PERSONAL)
@Controller({ version: "1" })
export class DeleteProgramTemplateController {
  constructor(
    private readonly deleteProgramTemplateUseCase: DeleteProgramTemplateUseCase,
  ) {}

  @ApiOperation({ summary: "Delete a program template" })
  @ApiNoContentResponse()
  @HttpCode(HttpStatus.NO_CONTENT)
  @Delete(":id")
  async handle(
    @Param("id") id: string,
    @CurrentUser() user: IAccessToken,
  ) {
    return this.deleteProgramTemplateUseCase.execute(id, user.personalId!);
  }
}
