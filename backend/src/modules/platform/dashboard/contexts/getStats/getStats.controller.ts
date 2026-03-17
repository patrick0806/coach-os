import { Controller, Get, HttpCode, HttpStatus } from "@nestjs/common";
import { ApiOkResponse, ApiOperation, ApiTags } from "@nestjs/swagger";

import { API_TAGS } from "@shared/constants";
import { CurrentUser, Roles } from "@shared/decorators";
import { ApplicationRoles } from "@shared/enums";
import { IAccessToken } from "@shared/interfaces/accessToken.interface";

import { GetStatsUseCase } from "./getStats.useCase";

@ApiTags(API_TAGS.PERSONALS)
@Roles(ApplicationRoles.PERSONAL)
@Controller({ version: "1", path: "/stats" })
export class GetStatsController {
  constructor(private readonly getStatsUseCase: GetStatsUseCase) { }

  @ApiOperation({ summary: "Get dashboard summary stats for the authenticated coach" })
  @ApiOkResponse()
  @HttpCode(HttpStatus.OK)
  @Get()
  async handle(@CurrentUser() user: IAccessToken) {
    return this.getStatsUseCase.execute(user.personalId!);
  }
}
