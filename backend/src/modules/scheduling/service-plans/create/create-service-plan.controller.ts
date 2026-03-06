import { Body, Controller, HttpCode, HttpStatus, Post } from "@nestjs/common";
import { ApiCreatedResponse, ApiOperation, ApiTags } from "@nestjs/swagger";

import { CurrentUser, Roles } from "@shared/decorators";
import { ApplicationRoles } from "@shared/enums";
import { IAccessToken } from "@shared/interfaces";
import { API_TAGS } from "@shared/constants";

import { CreateServicePlanService } from "./create-service-plan.service";
import { CreateServicePlanDTO } from "./dtos/request.dto";
import { ServicePlanDTO } from "../shared/dtos/service-plan.dto";

@Roles(ApplicationRoles.PERSONAL)
@ApiTags(API_TAGS.SERVICE_PLANS)
@Controller({ version: "1", path: "" })
export class CreateServicePlanController {
  constructor(private readonly createServicePlanService: CreateServicePlanService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: "Create a new service plan" })
  @ApiCreatedResponse({ type: ServicePlanDTO })
  handle(
    @Body() dto: CreateServicePlanDTO,
    @CurrentUser() user: IAccessToken,
  ): Promise<ServicePlanDTO> {
    return this.createServicePlanService.execute(dto, user);
  }
}
