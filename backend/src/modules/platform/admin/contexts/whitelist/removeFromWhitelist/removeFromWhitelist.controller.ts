import { Controller, Delete, HttpCode, HttpStatus, Param } from "@nestjs/common";
import { ApiBearerAuth, ApiNoContentResponse, ApiOperation, ApiTags } from "@nestjs/swagger";

import { API_TAGS } from "@shared/constants";
import { BypassTenantAccess } from "@shared/decorators/bypass-tenant-access.decorator";
import { Roles } from "@shared/decorators/roles.decorator";
import { ApplicationRoles } from "@shared/enums";

import { RemoveFromWhitelistUseCase } from "./removeFromWhitelist.useCase";

@ApiBearerAuth()
@ApiTags(API_TAGS.ADMIN)
@Roles(ApplicationRoles.ADMIN)
@BypassTenantAccess()
@Controller({ version: "1" })
export class RemoveFromWhitelistController {
  constructor(private readonly removeFromWhitelistUseCase: RemoveFromWhitelistUseCase) {}

  @ApiOperation({ summary: "Remove personal from whitelist (admin)" })
  @ApiNoContentResponse()
  @Delete("whitelist/:personalId")
  @HttpCode(HttpStatus.NO_CONTENT)
  async handle(@Param("personalId") personalId: string): Promise<void> {
    return this.removeFromWhitelistUseCase.execute(personalId);
  }
}
