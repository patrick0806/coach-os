import { Body, Controller, HttpCode, HttpStatus, Post } from "@nestjs/common";
import { ApiCreatedResponse, ApiOperation, ApiTags } from "@nestjs/swagger";

import { API_TAGS } from "@shared/constants";
import { CurrentUser, Roles } from "@shared/decorators";
import { ApplicationRoles } from "@shared/enums";
import { IAccessToken } from "@shared/interfaces/accessToken.interface";

import { BulkCreateAvailabilityRulesRequestDTO } from "./dtos/request.dto";
import { BulkCreateAvailabilityRulesResponseDTO } from "./dtos/response.dto";
import { BulkCreateAvailabilityRulesUseCase } from "./bulkCreateRules.useCase";

@ApiTags(API_TAGS.AVAILABILITY)
@Roles(ApplicationRoles.PERSONAL)
@Controller({ version: "1", path: "availability-rules/bulk" })
export class BulkCreateAvailabilityRulesController {
  constructor(
    private readonly bulkCreateAvailabilityRulesUseCase: BulkCreateAvailabilityRulesUseCase,
  ) {}

  @ApiOperation({ summary: "Bulk create availability rules — skips conflicts, creates valid ones" })
  @ApiCreatedResponse({ type: BulkCreateAvailabilityRulesResponseDTO })
  @HttpCode(HttpStatus.CREATED)
  @Post()
  async handle(
    @Body() body: BulkCreateAvailabilityRulesRequestDTO,
    @CurrentUser() user: IAccessToken,
  ): Promise<BulkCreateAvailabilityRulesResponseDTO> {
    return this.bulkCreateAvailabilityRulesUseCase.execute(body, user.personalId!);
  }
}
