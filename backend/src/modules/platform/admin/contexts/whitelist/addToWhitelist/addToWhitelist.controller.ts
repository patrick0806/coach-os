import { Controller, HttpCode, HttpStatus, Param, Post } from "@nestjs/common";
import { ApiBearerAuth, ApiNoContentResponse, ApiOperation, ApiTags } from "@nestjs/swagger";

import { API_TAGS } from "@shared/constants";
import { BypassTenantAccess } from "@shared/decorators/bypass-tenant-access.decorator";
import { Roles } from "@shared/decorators/roles.decorator";
import { ApplicationRoles } from "@shared/enums";

import { AddToWhitelistUseCase } from "./addToWhitelist.useCase";

@ApiBearerAuth()
@ApiTags(API_TAGS.ADMIN)
@Roles(ApplicationRoles.ADMIN)
@BypassTenantAccess()
@Controller({ version: "1" })
export class AddToWhitelistController {
  constructor(private readonly addToWhitelistUseCase: AddToWhitelistUseCase) {}

  @ApiOperation({ summary: "Add personal to whitelist (admin)" })
  @ApiNoContentResponse()
  @Post("whitelist/:personalId")
  @HttpCode(HttpStatus.NO_CONTENT)
  async handle(@Param("personalId") personalId: string): Promise<void> {
    return this.addToWhitelistUseCase.execute(personalId);
  }
}
