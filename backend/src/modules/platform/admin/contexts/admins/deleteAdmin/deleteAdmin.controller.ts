import { Controller, Delete, HttpCode, HttpStatus, Param, Request } from "@nestjs/common";
import { ApiBearerAuth, ApiNoContentResponse, ApiOperation, ApiTags } from "@nestjs/swagger";

import { API_TAGS } from "@shared/constants";
import { BypassTenantAccess } from "@shared/decorators/bypass-tenant-access.decorator";
import { Roles } from "@shared/decorators/roles.decorator";
import { ApplicationRoles } from "@shared/enums";

import { DeleteAdminUseCase } from "./deleteAdmin.useCase";

@ApiBearerAuth()
@ApiTags(API_TAGS.ADMIN)
@Roles(ApplicationRoles.ADMIN)
@BypassTenantAccess()
@Controller({ version: "1" })
export class DeleteAdminController {
  constructor(private readonly deleteAdminUseCase: DeleteAdminUseCase) {}

  @ApiOperation({ summary: "Delete admin (cannot delete self)" })
  @ApiNoContentResponse()
  @Delete(":id")
  @HttpCode(HttpStatus.NO_CONTENT)
  async handle(
    @Param("id") id: string,
    @Request() req: { user: { profileId: string } },
  ): Promise<void> {
    return this.deleteAdminUseCase.execute(id, req.user.profileId);
  }
}
