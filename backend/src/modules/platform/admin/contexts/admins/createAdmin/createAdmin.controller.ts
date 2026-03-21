import { Body, Controller, Post } from "@nestjs/common";
import { ApiBearerAuth, ApiCreatedResponse, ApiOperation, ApiTags } from "@nestjs/swagger";

import { API_TAGS } from "@shared/constants";
import { BypassTenantAccess } from "@shared/decorators/bypass-tenant-access.decorator";
import { Roles } from "@shared/decorators/roles.decorator";
import { ApplicationRoles } from "@shared/enums";

import { CreateAdminUseCase } from "./createAdmin.useCase";
import { CreateAdminRequestDTO } from "./dtos/request.dto";
import { AdminResponseDTO } from "../listAdmins/dtos/response.dto";

@ApiBearerAuth()
@ApiTags(API_TAGS.ADMIN)
@Roles(ApplicationRoles.ADMIN)
@BypassTenantAccess()
@Controller({ version: "1" })
export class CreateAdminController {
  constructor(private readonly createAdminUseCase: CreateAdminUseCase) {}

  @ApiOperation({ summary: "Create admin user" })
  @ApiCreatedResponse({ description: "Admin user created successfully", type: AdminResponseDTO })
  @Post()
  async handle(@Body() body: CreateAdminRequestDTO) {
    return this.createAdminUseCase.execute(body);
  }
}
