import { Body, Controller, HttpCode, HttpStatus, Post } from "@nestjs/common";
import {
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from "@nestjs/swagger";

import { CurrentUser, Roles } from "@shared/decorators";
import { ApplicationRoles } from "@shared/enums";
import { IAccessToken } from "@shared/interfaces/accessToken.interface";

import { BulkCreateWorkingHoursRequestDTO } from "./dtos/request.dto";
import { BulkCreateWorkingHoursResponseDTO } from "./dtos/response.dto";
import { BulkCreateWorkingHoursUseCase } from "./bulkCreateWorkingHours.useCase";

@ApiTags("Working Hours")
@Roles(ApplicationRoles.PERSONAL)
@Controller({ version: "1", path: "working-hours" })
export class BulkCreateWorkingHoursController {
  constructor(
    private readonly bulkCreateWorkingHoursUseCase: BulkCreateWorkingHoursUseCase,
  ) {}

  @ApiOperation({ summary: "Bulk create working hours" })
  @ApiOkResponse({ type: BulkCreateWorkingHoursResponseDTO })
  @HttpCode(HttpStatus.OK)
  @Post("bulk")
  async handle(
    @Body() body: BulkCreateWorkingHoursRequestDTO,
    @CurrentUser() user: IAccessToken,
  ) {
    return this.bulkCreateWorkingHoursUseCase.execute(body, user.personalId!);
  }
}
