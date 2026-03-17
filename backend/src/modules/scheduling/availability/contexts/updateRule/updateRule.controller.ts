import { Body, Controller, HttpCode, HttpStatus, Param, Put } from "@nestjs/common";
import {
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from "@nestjs/swagger";

import { API_TAGS } from "@shared/constants";
import { CurrentUser, Roles } from "@shared/decorators";
import { ApplicationRoles } from "@shared/enums";
import { IAccessToken } from "@shared/interfaces/accessToken.interface";

import { UpdateAvailabilityRuleRequestDTO } from "./dtos/request.dto";
import { UpdateAvailabilityRuleResponseDTO } from "./dtos/response.dto";
import { UpdateAvailabilityRuleUseCase } from "./updateRule.useCase";

@ApiTags(API_TAGS.AVAILABILITY)
@Roles(ApplicationRoles.PERSONAL)
@Controller({ version: "1", path: "availability-rules" })
export class UpdateAvailabilityRuleController {
  constructor(
    private readonly updateAvailabilityRuleUseCase: UpdateAvailabilityRuleUseCase,
  ) {}

  @ApiOperation({ summary: "Update an availability rule" })
  @ApiOkResponse({ type: UpdateAvailabilityRuleResponseDTO })
  @ApiNotFoundResponse({ description: "Availability rule not found" })
  @HttpCode(HttpStatus.OK)
  @Put(":id")
  async handle(
    @Param("id") id: string,
    @Body() body: UpdateAvailabilityRuleRequestDTO,
    @CurrentUser() user: IAccessToken,
  ) {
    return this.updateAvailabilityRuleUseCase.execute(
      id,
      body,
      user.personalId!,
    );
  }
}
