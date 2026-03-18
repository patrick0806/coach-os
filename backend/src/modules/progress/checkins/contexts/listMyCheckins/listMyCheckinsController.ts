import { Controller, Get, HttpCode, HttpStatus, Query } from "@nestjs/common";
import {
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from "@nestjs/swagger";

import { API_TAGS } from "@shared/constants";
import { CurrentUser, Roles } from "@shared/decorators";
import { ApplicationRoles } from "@shared/enums";
import { IAccessToken } from "@shared/interfaces/accessToken.interface";

import { ListMyCheckinsUseCase } from "./listMyCheckinsUseCase";

@ApiTags(API_TAGS.STUDENTS)
@Roles(ApplicationRoles.STUDENT)
@Controller({ version: "1", path: "me/progress-checkins" })
export class ListMyCheckinsController {
  constructor(private readonly listMyCheckinsUseCase: ListMyCheckinsUseCase) {}

  @ApiOperation({ summary: "List my progress checkins (student)" })
  @ApiOkResponse({ description: "Paginated checkins list" })
  @HttpCode(HttpStatus.OK)
  @Get()
  async handle(
    @Query("page") page = "0",
    @Query("size") size = "10",
    @CurrentUser() user: IAccessToken,
  ) {
    return this.listMyCheckinsUseCase.execute(
      user.profileId,
      user.personalId!,
      {
        page: Number(page),
        size: Number(size),
      },
    );
  }
}
