import { Controller, Get, HttpCode, HttpStatus } from "@nestjs/common";
import { ApiOkResponse, ApiOperation, ApiTags } from "@nestjs/swagger";

import { CurrentUser, Roles } from "@shared/decorators";
import { ApplicationRoles } from "@shared/enums";
import { IAccessToken } from "@shared/interfaces/accessToken.interface";

import { ListMyRecurringSlotsUseCase } from "./listMyRecurringSlots.useCase";

@ApiTags("Recurring Slots")
@Roles(ApplicationRoles.STUDENT)
@Controller({ version: "1", path: "me/recurring-slots" })
export class ListMyRecurringSlotsController {
  constructor(
    private readonly listMyRecurringSlotsUseCase: ListMyRecurringSlotsUseCase,
  ) {}

  @ApiOperation({ summary: "List my recurring slots (student)" })
  @ApiOkResponse()
  @HttpCode(HttpStatus.OK)
  @Get()
  async handle(@CurrentUser() user: IAccessToken) {
    return this.listMyRecurringSlotsUseCase.execute(
      user.profileId!,
      user.personalId!,
    );
  }
}
