import { Controller, Get, HttpCode, HttpStatus } from "@nestjs/common";
import { ApiOkResponse, ApiOperation, ApiTags } from "@nestjs/swagger";

import { API_TAGS } from "@shared/constants";
import { CurrentUser, Roles } from "@shared/decorators";
import { ApplicationRoles } from "@shared/enums";
import { IAccessToken } from "@shared/interfaces/accessToken.interface";

import { ListAvailabilityRulesUseCase } from "./listRules.useCase";

@ApiTags(API_TAGS.AVAILABILITY)
@Roles(ApplicationRoles.PERSONAL)
@Controller({ version: "1", path: "availability-rules" })
export class ListAvailabilityRulesController {
  constructor(
    private readonly listAvailabilityRulesUseCase: ListAvailabilityRulesUseCase,
  ) {}

  @ApiOperation({ summary: "List availability rules" })
  @ApiOkResponse()
  @HttpCode(HttpStatus.OK)
  @Get()
  async handle(@CurrentUser() user: IAccessToken) {
    return this.listAvailabilityRulesUseCase.execute(user.personalId!);
  }
}
