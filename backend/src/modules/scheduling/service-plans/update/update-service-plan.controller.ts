import { Body, Controller, HttpCode, HttpStatus, Param, Patch } from "@nestjs/common";
import { ApiOkResponse, ApiOperation, ApiTags } from "@nestjs/swagger";

import { CurrentUser, Roles } from "@shared/decorators";
import { ApplicationRoles } from "@shared/enums";
import { IAccessToken } from "@shared/interfaces";
import { API_TAGS } from "@shared/constants";

import { UpdateServicePlanService } from "./update-service-plan.service";
import { UpdateServicePlanDTO } from "./dtos/request.dto";
import { ServicePlanDTO } from "../shared/dtos/service-plan.dto";

@Roles(ApplicationRoles.PERSONAL)
@ApiTags(API_TAGS.SERVICE_PLANS)
@Controller({ version: "1", path: "" })
export class UpdateServicePlanController {
  constructor(private readonly updateServicePlanService: UpdateServicePlanService) {}

  @Patch(":id")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Update a service plan" })
  @ApiOkResponse({ type: ServicePlanDTO })
  handle(
    @Param("id") id: string,
    @Body() dto: UpdateServicePlanDTO,
    @CurrentUser() user: IAccessToken,
  ): Promise<ServicePlanDTO> {
    return this.updateServicePlanService.execute(id, dto, user);
  }
}
