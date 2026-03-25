import { Controller, Get, HttpCode, HttpStatus } from "@nestjs/common";
import { ApiOkResponse, ApiOperation, ApiTags } from "@nestjs/swagger";

import { CurrentUser, Roles } from "@shared/decorators";
import { ApplicationRoles } from "@shared/enums";
import { IAccessToken } from "@shared/interfaces/accessToken.interface";

import { ListWorkingHoursUseCase } from "./listWorkingHours.useCase";

@ApiTags("Working Hours")
@Roles(ApplicationRoles.PERSONAL)
@Controller({ version: "1", path: "working-hours" })
export class ListWorkingHoursController {
  constructor(
    private readonly listWorkingHoursUseCase: ListWorkingHoursUseCase,
  ) {}

  @ApiOperation({ summary: "List working hours" })
  @ApiOkResponse()
  @HttpCode(HttpStatus.OK)
  @Get()
  async handle(@CurrentUser() user: IAccessToken) {
    return this.listWorkingHoursUseCase.execute(user.personalId!);
  }
}
