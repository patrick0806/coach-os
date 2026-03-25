import { Controller, Delete, HttpCode, HttpStatus, Param } from "@nestjs/common";
import {
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiOperation,
  ApiTags,
} from "@nestjs/swagger";

import { CurrentUser, Roles } from "@shared/decorators";
import { ApplicationRoles } from "@shared/enums";
import { IAccessToken } from "@shared/interfaces/accessToken.interface";

import { DeleteRecurringSlotUseCase } from "./deleteRecurringSlot.useCase";

@ApiTags("Recurring Slots")
@Roles(ApplicationRoles.PERSONAL)
@Controller({ version: "1", path: "recurring-slots" })
export class DeleteRecurringSlotController {
  constructor(
    private readonly deleteRecurringSlotUseCase: DeleteRecurringSlotUseCase,
  ) {}

  @ApiOperation({ summary: "Delete a recurring slot" })
  @ApiNoContentResponse()
  @ApiNotFoundResponse({ description: "Recurring slot not found" })
  @HttpCode(HttpStatus.NO_CONTENT)
  @Delete(":id")
  async handle(
    @Param("id") id: string,
    @CurrentUser() user: IAccessToken,
  ) {
    return this.deleteRecurringSlotUseCase.execute(id, user.personalId!);
  }
}
