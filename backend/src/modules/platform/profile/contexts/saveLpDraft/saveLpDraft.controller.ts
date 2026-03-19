import { Body, Controller, HttpCode, HttpStatus, Put } from "@nestjs/common";
import { ApiOkResponse, ApiOperation, ApiTags } from "@nestjs/swagger";

import { API_TAGS } from "@shared/constants";
import { CurrentUser, Roles } from "@shared/decorators";
import { ApplicationRoles } from "@shared/enums";
import { IAccessToken } from "@shared/interfaces/accessToken.interface";

import { SaveLpDraftUseCase } from "./saveLpDraft.useCase";

@ApiTags(API_TAGS.PERSONALS)
@Roles(ApplicationRoles.PERSONAL)
@Controller({ version: "1" })
export class SaveLpDraftController {
  constructor(private readonly saveLpDraftUseCase: SaveLpDraftUseCase) {}

  @ApiOperation({ summary: "Save LP fields as draft (does not affect published page)" })
  @ApiOkResponse()
  @HttpCode(HttpStatus.OK)
  @Put("lp-draft")
  async handle(@Body() body: unknown, @CurrentUser() user: IAccessToken) {
    await this.saveLpDraftUseCase.execute(user.personalId!, body);
  }
}
