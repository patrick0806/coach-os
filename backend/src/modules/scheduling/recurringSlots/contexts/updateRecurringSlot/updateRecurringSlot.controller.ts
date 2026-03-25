import { Body, Controller, HttpCode, HttpStatus, Param, Patch } from "@nestjs/common";
import {
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from "@nestjs/swagger";

import { CurrentUser, Roles } from "@shared/decorators";
import { ApplicationRoles } from "@shared/enums";
import { IAccessToken } from "@shared/interfaces/accessToken.interface";

import { UpdateRecurringSlotRequestDTO } from "./dtos/request.dto";
import { UpdateRecurringSlotResponseDTO } from "./dtos/response.dto";
import { UpdateRecurringSlotUseCase } from "./updateRecurringSlot.useCase";

@ApiTags("Recurring Slots")
@Roles(ApplicationRoles.PERSONAL)
@Controller({ version: "1", path: "recurring-slots" })
export class UpdateRecurringSlotController {
  constructor(
    private readonly updateRecurringSlotUseCase: UpdateRecurringSlotUseCase,
  ) {}

  @ApiOperation({ summary: "Update a recurring slot (versioning)" })
  @ApiOkResponse({ type: UpdateRecurringSlotResponseDTO })
  @ApiNotFoundResponse({ description: "Recurring slot not found" })
  @HttpCode(HttpStatus.OK)
  @Patch(":id")
  async handle(
    @Param("id") id: string,
    @Body() body: UpdateRecurringSlotRequestDTO,
    @CurrentUser() user: IAccessToken,
  ) {
    return this.updateRecurringSlotUseCase.execute(id, body, user.personalId!);
  }
}
