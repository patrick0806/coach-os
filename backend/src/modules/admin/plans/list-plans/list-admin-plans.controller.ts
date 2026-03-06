import { Controller, Get } from "@nestjs/common";
import { ApiOkResponse, ApiOperation, ApiTags } from "@nestjs/swagger";

import { Roles } from "@shared/decorators";
import { ApplicationRoles } from "@shared/enums";
import { API_TAGS } from "@shared/constants";

import { ListAdminPlansService } from "./list-admin-plans.service";

@Roles(ApplicationRoles.ADMIN)
@ApiTags(API_TAGS.ADMIN)
@Controller({ version: "1", path: "plans" })
export class ListAdminPlansController {
  constructor(private readonly listAdminPlansService: ListAdminPlansService) {}

  @Get()
  @ApiOperation({ summary: "List all SaaS plans including inactive (admin only)" })
  @ApiOkResponse()
  handle() {
    return this.listAdminPlansService.execute();
  }
}
