import { Controller, Get, HttpCode, HttpStatus } from "@nestjs/common";
import { ApiOkResponse, ApiOperation, ApiTags } from "@nestjs/swagger";

import { API_TAGS } from "@shared/constants";
import { CurrentUser, Roles } from "@shared/decorators";
import { ApplicationRoles } from "@shared/enums";
import { IAccessToken } from "@shared/interfaces/accessToken.interface";

import { GetProfileUseCase } from "./getProfile.useCase";

@ApiTags(API_TAGS.PERSONALS)
@Roles(ApplicationRoles.PERSONAL)
@Controller({ version: "1", path: "profile" })
export class GetProfileController {
  constructor(private readonly getProfileUseCase: GetProfileUseCase) {}

  @ApiOperation({ summary: "Get the authenticated coach profile" })
  @ApiOkResponse()
  @HttpCode(HttpStatus.OK)
  @Get()
  async handle(@CurrentUser() user: IAccessToken) {
    return this.getProfileUseCase.execute(user.personalId!);
  }
}
