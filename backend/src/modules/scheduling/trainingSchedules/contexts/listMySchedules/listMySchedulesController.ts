import { Controller, Get, HttpCode, HttpStatus } from "@nestjs/common";
import { ApiOkResponse, ApiOperation, ApiTags } from "@nestjs/swagger";

import { API_TAGS } from "@shared/constants";
import { CurrentUser, Roles } from "@shared/decorators";
import { ApplicationRoles } from "@shared/enums";
import { IAccessToken } from "@shared/interfaces/accessToken.interface";

import { ListMySchedulesUseCase } from "./listMySchedulesUseCase";

@ApiTags(API_TAGS.TRAINING_SCHEDULE)
@Roles(ApplicationRoles.STUDENT)
@Controller({ version: "1", path: "me/training-schedules" })
export class ListMySchedulesController {
  constructor(
    private readonly listMySchedulesUseCase: ListMySchedulesUseCase,
  ) {}

  @ApiOperation({ summary: "List my training schedules (student)" })
  @ApiOkResponse()
  @HttpCode(HttpStatus.OK)
  @Get()
  async handle(@CurrentUser() user: IAccessToken) {
    return this.listMySchedulesUseCase.execute(
      user.profileId,
      user.personalId!,
    );
  }
}
