import { Controller, HttpCode, HttpStatus, Post } from "@nestjs/common";
import { ApiOkResponse, ApiOperation, ApiTags } from "@nestjs/swagger";

import { API_TAGS } from "@shared/constants";
import { CurrentUser, Roles } from "@shared/decorators";
import { ApplicationRoles } from "@shared/enums";
import { IAccessToken } from "@shared/interfaces/accessToken.interface";

import { PublishLpDraftUseCase } from "./publishLpDraft.useCase";

@ApiTags(API_TAGS.PERSONALS)
@Roles(ApplicationRoles.PERSONAL)
@Controller({ version: "1" })
export class PublishLpDraftController {
  constructor(private readonly publishLpDraftUseCase: PublishLpDraftUseCase) {}

  @ApiOperation({ summary: "Publish the saved LP draft to the public page" })
  @ApiOkResponse()
  @HttpCode(HttpStatus.OK)
  @Post("lp/publish")
  async handle(@CurrentUser() user: IAccessToken) {
    await this.publishLpDraftUseCase.execute(user.personalId!);
  }
}
