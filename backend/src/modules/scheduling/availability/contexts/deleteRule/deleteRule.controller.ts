import { Controller, Delete, HttpCode, HttpStatus, Param } from "@nestjs/common";
import {
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiOperation,
  ApiTags,
} from "@nestjs/swagger";

import { API_TAGS } from "@shared/constants";
import { CurrentUser, Roles } from "@shared/decorators";
import { ApplicationRoles } from "@shared/enums";
import { IAccessToken } from "@shared/interfaces/accessToken.interface";

import { DeleteAvailabilityRuleUseCase } from "./deleteRule.useCase";

@ApiTags(API_TAGS.AVAILABILITY)
@Roles(ApplicationRoles.PERSONAL)
@Controller({ version: "1", path: "availability-rules" })
export class DeleteAvailabilityRuleController {
  constructor(
    private readonly deleteAvailabilityRuleUseCase: DeleteAvailabilityRuleUseCase,
  ) {}

  @ApiOperation({ summary: "Delete an availability rule" })
  @ApiNoContentResponse()
  @ApiNotFoundResponse({ description: "Availability rule not found" })
  @HttpCode(HttpStatus.NO_CONTENT)
  @Delete(":id")
  async handle(
    @Param("id") id: string,
    @CurrentUser() user: IAccessToken,
  ) {
    return this.deleteAvailabilityRuleUseCase.execute(id, user.personalId!);
  }
}
