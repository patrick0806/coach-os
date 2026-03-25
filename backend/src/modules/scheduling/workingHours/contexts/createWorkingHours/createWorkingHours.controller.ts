import { Body, Controller, HttpCode, HttpStatus, Post } from "@nestjs/common";
import {
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiOperation,
  ApiTags,
} from "@nestjs/swagger";

import { CurrentUser, Roles } from "@shared/decorators";
import { ApplicationRoles } from "@shared/enums";
import { IAccessToken } from "@shared/interfaces/accessToken.interface";

import { CreateWorkingHoursRequestDTO } from "./dtos/request.dto";
import { CreateWorkingHoursResponseDTO } from "./dtos/response.dto";
import { CreateWorkingHoursUseCase } from "./createWorkingHours.useCase";

@ApiTags("Working Hours")
@Roles(ApplicationRoles.PERSONAL)
@Controller({ version: "1", path: "working-hours" })
export class CreateWorkingHoursController {
  constructor(
    private readonly createWorkingHoursUseCase: CreateWorkingHoursUseCase,
  ) {}

  @ApiOperation({ summary: "Create working hours" })
  @ApiCreatedResponse({ type: CreateWorkingHoursResponseDTO })
  @ApiConflictResponse({ description: "Overlapping working hours exist" })
  @HttpCode(HttpStatus.CREATED)
  @Post()
  async handle(
    @Body() body: CreateWorkingHoursRequestDTO,
    @CurrentUser() user: IAccessToken,
  ) {
    return this.createWorkingHoursUseCase.execute(body, user.personalId!);
  }
}
