import { Controller, Get, HttpCode, HttpStatus } from "@nestjs/common";
import { ApiOkResponse, ApiOperation, ApiTags } from "@nestjs/swagger";

import { API_TAGS } from "@shared/constants";
import { CurrentUser, Roles } from "@shared/decorators";
import { ApplicationRoles } from "@shared/enums";
import { IAccessToken } from "@shared/interfaces/accessToken.interface";

import { GetTourProgressUseCase } from "./getTourProgress.useCase";

@ApiTags(API_TAGS.PERSONALS)
@Roles(ApplicationRoles.PERSONAL)
@Controller({ version: "1" })
export class GetTourProgressController {
  constructor(private readonly getTourProgressUseCase: GetTourProgressUseCase) {}

  @ApiOperation({ summary: "Get the authenticated coach tour progress" })
  @ApiOkResponse({ schema: { type: "array", items: { type: "string" } } })
  @HttpCode(HttpStatus.OK)
  @Get("tour-progress")
  async handle(@CurrentUser() user: IAccessToken) {
    return this.getTourProgressUseCase.execute(user.personalId!);
  }
}
