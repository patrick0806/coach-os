import { Body, Controller, HttpCode, HttpStatus, Post } from "@nestjs/common";
import {
  ApiCreatedResponse,
  ApiOperation,
  ApiTags,
} from "@nestjs/swagger";

import { CurrentUser, Roles } from "@shared/decorators";
import { ApplicationRoles } from "@shared/enums";
import { IAccessToken } from "@shared/interfaces/accessToken.interface";

import { CreateRecurringSlotRequestDTO } from "./dtos/request.dto";
import { CreateRecurringSlotResponseDTO } from "./dtos/response.dto";
import { CreateRecurringSlotUseCase } from "./createRecurringSlot.useCase";

@ApiTags("Recurring Slots")
@Roles(ApplicationRoles.PERSONAL)
@Controller({ version: "1", path: "recurring-slots" })
export class CreateRecurringSlotController {
  constructor(
    private readonly createRecurringSlotUseCase: CreateRecurringSlotUseCase,
  ) {}

  @ApiOperation({ summary: "Create a recurring slot" })
  @ApiCreatedResponse({ type: CreateRecurringSlotResponseDTO })
  @HttpCode(HttpStatus.CREATED)
  @Post()
  async handle(
    @Body() body: CreateRecurringSlotRequestDTO,
    @CurrentUser() user: IAccessToken,
  ) {
    return this.createRecurringSlotUseCase.execute(body, user.personalId!);
  }
}
