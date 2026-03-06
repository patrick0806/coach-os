import { Controller, Delete, HttpCode, HttpStatus, Param } from "@nestjs/common";
import { ApiNoContentResponse, ApiOperation, ApiTags } from "@nestjs/swagger";

import { CurrentUser, Roles } from "@shared/decorators";
import { ApplicationRoles } from "@shared/enums";
import { IAccessToken } from "@shared/interfaces";
import { API_TAGS } from "@shared/constants";

import { DeactivateServicePlanService } from "./deactivate-service-plan.service";

@Roles(ApplicationRoles.PERSONAL)
@ApiTags(API_TAGS.SERVICE_PLANS)
@Controller({ version: "1", path: "" })
export class DeactivateServicePlanController {
  constructor(private readonly deactivateServicePlanService: DeactivateServicePlanService) {}

  @Delete(":id")
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: "Deactivate a service plan (soft delete)" })
  @ApiNoContentResponse()
  handle(@Param("id") id: string, @CurrentUser() user: IAccessToken): Promise<void> {
    return this.deactivateServicePlanService.execute(id, user);
  }
}
