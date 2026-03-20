import { Controller, HttpCode, HttpStatus, Param, Post } from "@nestjs/common";
import { ApiOkResponse, ApiOperation, ApiTags } from "@nestjs/swagger";

import { API_TAGS } from "@shared/constants";
import { CurrentUser, Roles } from "@shared/decorators";
import { ApplicationRoles } from "@shared/enums";
import { IAccessToken } from "@shared/interfaces/accessToken.interface";

import { MarkPageTouredUseCase } from "./markPageToured.useCase";

@ApiTags(API_TAGS.PERSONALS)
@Roles(ApplicationRoles.PERSONAL)
@Controller({ version: "1" })
export class MarkPageTouredController {
  constructor(private readonly markPageTouredUseCase: MarkPageTouredUseCase) {}

  @ApiOperation({ summary: "Mark a tour page as completed for the authenticated coach" })
  @ApiOkResponse({ schema: { type: "array", items: { type: "string" } } })
  @HttpCode(HttpStatus.OK)
  @Post("tour-progress/:page")
  async handle(@CurrentUser() user: IAccessToken, @Param("page") page: string) {
    return this.markPageTouredUseCase.execute(user.personalId!, page);
  }
}
