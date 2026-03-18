import { Controller, Get, Param } from "@nestjs/common";
import { ApiOkResponse, ApiNotFoundResponse, ApiOperation, ApiTags } from "@nestjs/swagger";

import { API_TAGS } from "@shared/constants";
import { CurrentUser, Roles } from "@shared/decorators";
import { ApplicationRoles } from "@shared/enums";
import { IAccessToken } from "@shared/interfaces/accessToken.interface";

import { CheckinResponseDTO } from "../createCheckin/dtos/response.dto";
import { GetCheckinUseCase } from "./getCheckin.useCase";

@ApiTags(API_TAGS.STUDENTS)
@Roles(ApplicationRoles.PERSONAL)
@Controller({ version: "1", path: "progress-checkins" })
export class GetCheckinController {
  constructor(private readonly getCheckinUseCase: GetCheckinUseCase) {}

  @ApiOperation({ summary: "Get a progress checkin by ID" })
  @ApiOkResponse({ type: CheckinResponseDTO })
  @ApiNotFoundResponse({ description: "Checkin not found" })
  @Get(":id")
  async handle(@Param("id") id: string, @CurrentUser() user: IAccessToken) {
    return this.getCheckinUseCase.execute(id, user.personalId!);
  }
}
