import { Body, Controller, HttpCode, HttpStatus, Patch } from "@nestjs/common";
import { ApiNoContentResponse, ApiOperation, ApiTags } from "@nestjs/swagger";

import { Roles } from "@shared/decorators";
import { ApplicationRoles } from "@shared/enums";
import { API_TAGS } from "@shared/constants";

import { ReorderPlansService } from "./reorder-plans.service";
import { ReorderPlansDTO } from "./dtos/request.dto";

@Roles(ApplicationRoles.ADMIN)
@ApiTags(API_TAGS.ADMIN)
@Controller({ version: "1", path: "plans" })
export class ReorderPlansController {
  constructor(private readonly reorderPlansService: ReorderPlansService) {}

  @Patch("reorder")
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: "Reorder SaaS plans (admin only)" })
  @ApiNoContentResponse()
  handle(@Body() dto: ReorderPlansDTO): Promise<void> {
    return this.reorderPlansService.execute(dto.items);
  }
}
