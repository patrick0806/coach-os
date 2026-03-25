import { Controller, Get, HttpCode, HttpStatus, Query } from "@nestjs/common";
import { ApiOkResponse, ApiOperation, ApiQuery, ApiTags } from "@nestjs/swagger";

import { CurrentUser, Roles } from "@shared/decorators";
import { ApplicationRoles } from "@shared/enums";
import { IAccessToken } from "@shared/interfaces/accessToken.interface";

import { ListRecurringSlotsUseCase } from "./listRecurringSlots.useCase";

@ApiTags("Recurring Slots")
@Roles(ApplicationRoles.PERSONAL)
@Controller({ version: "1", path: "recurring-slots" })
export class ListRecurringSlotsController {
  constructor(
    private readonly listRecurringSlotsUseCase: ListRecurringSlotsUseCase,
  ) {}

  @ApiOperation({ summary: "List recurring slots" })
  @ApiOkResponse()
  @ApiQuery({ name: "studentId", required: false })
  @HttpCode(HttpStatus.OK)
  @Get()
  async handle(
    @Query("studentId") studentId: string | undefined,
    @CurrentUser() user: IAccessToken,
  ) {
    return this.listRecurringSlotsUseCase.execute(
      user.personalId!,
      studentId,
    );
  }
}
