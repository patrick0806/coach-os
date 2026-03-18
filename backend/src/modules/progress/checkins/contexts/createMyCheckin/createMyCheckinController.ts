import { Body, Controller, HttpCode, HttpStatus, Post } from "@nestjs/common";
import {
  ApiCreatedResponse,
  ApiOperation,
  ApiTags,
} from "@nestjs/swagger";

import { API_TAGS } from "@shared/constants";
import { CurrentUser, Roles } from "@shared/decorators";
import { ApplicationRoles } from "@shared/enums";
import { IAccessToken } from "@shared/interfaces/accessToken.interface";

import { CreateCheckinUseCase } from "../createCheckin/createCheckin.useCase";

@ApiTags(API_TAGS.STUDENTS)
@Roles(ApplicationRoles.STUDENT)
@Controller({ version: "1", path: "me/progress-checkins" })
export class CreateMyCheckinController {
  constructor(private readonly createCheckinUseCase: CreateCheckinUseCase) {}

  @ApiOperation({ summary: "Create a progress checkin for myself (student)" })
  @ApiCreatedResponse({ description: "Checkin created" })
  @HttpCode(HttpStatus.CREATED)
  @Post()
  async handle(
    @Body() body: unknown,
    @CurrentUser() user: IAccessToken,
  ) {
    return this.createCheckinUseCase.execute(
      user.profileId,
      body,
      user.personalId!,
    );
  }
}
