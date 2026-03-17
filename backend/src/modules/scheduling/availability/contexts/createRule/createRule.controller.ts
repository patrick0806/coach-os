import { Body, Controller, HttpCode, HttpStatus, Post } from "@nestjs/common";
import {
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiOperation,
  ApiTags,
} from "@nestjs/swagger";

import { API_TAGS } from "@shared/constants";
import { CurrentUser, Roles } from "@shared/decorators";
import { ApplicationRoles } from "@shared/enums";
import { IAccessToken } from "@shared/interfaces/accessToken.interface";

import { CreateAvailabilityRuleRequestDTO } from "./dtos/request.dto";
import { CreateAvailabilityRuleResponseDTO } from "./dtos/response.dto";
import { CreateAvailabilityRuleUseCase } from "./createRule.useCase";

@ApiTags(API_TAGS.AVAILABILITY)
@Roles(ApplicationRoles.PERSONAL)
@Controller({ version: "1", path: "availability-rules" })
export class CreateAvailabilityRuleController {
  constructor(
    private readonly createAvailabilityRuleUseCase: CreateAvailabilityRuleUseCase,
  ) {}

  @ApiOperation({ summary: "Create an availability rule" })
  @ApiCreatedResponse({ type: CreateAvailabilityRuleResponseDTO })
  @ApiConflictResponse({ description: "Overlapping rule exists" })
  @HttpCode(HttpStatus.CREATED)
  @Post()
  async handle(
    @Body() body: CreateAvailabilityRuleRequestDTO,
    @CurrentUser() user: IAccessToken,
  ) {
    return this.createAvailabilityRuleUseCase.execute(body, user.personalId!);
  }
}
