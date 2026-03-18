import { Controller, Get, HttpCode, HttpStatus } from "@nestjs/common";
import { ApiOkResponse, ApiOperation, ApiTags } from "@nestjs/swagger";

import { API_TAGS } from "@shared/constants";
import { CurrentUser, Roles } from "@shared/decorators";
import { ApplicationRoles } from "@shared/enums";
import { IAccessToken } from "@shared/interfaces/accessToken.interface";

import { GetMyProgramsUseCase } from "./getMyPrograms.useCase";

@ApiTags(API_TAGS.WORKOUT_PLANS)
@Roles(ApplicationRoles.STUDENT)
@Controller({ version: "1", path: "me" })
export class GetMyProgramsController {
  constructor(private readonly getMyProgramsUseCase: GetMyProgramsUseCase) { }

  @ApiOperation({ summary: "Get active programs for the authenticated student" })
  @ApiOkResponse()
  @HttpCode(HttpStatus.OK)
  @Get()
  async handle(@CurrentUser() user: IAccessToken) {
    return this.getMyProgramsUseCase.execute(user.profileId, user.personalId!);
  }
}
