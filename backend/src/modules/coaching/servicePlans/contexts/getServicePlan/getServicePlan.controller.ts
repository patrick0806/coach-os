import { Controller, Get, HttpCode, HttpStatus, Param } from "@nestjs/common";
import { ApiOkResponse, ApiOperation, ApiTags } from "@nestjs/swagger";

import { API_TAGS } from "@shared/constants";
import { CurrentUser, Roles } from "@shared/decorators";
import { ApplicationRoles } from "@shared/enums";
import { IAccessToken } from "@shared/interfaces/accessToken.interface";

import { CreateServicePlanResponseDTO } from "../createServicePlan/dtos/response.dto";
import { GetServicePlanUseCase } from "./getServicePlan.useCase";

@ApiTags(API_TAGS.SERVICE_PLANS)
@Roles(ApplicationRoles.PERSONAL)
@Controller({ version: "1", path: "" })
export class GetServicePlanController {
  constructor(private readonly getServicePlanUseCase: GetServicePlanUseCase) { }

  @ApiOperation({ summary: "Get a service plan by ID" })
  @ApiOkResponse({ type: CreateServicePlanResponseDTO })
  @HttpCode(HttpStatus.OK)
  @Get(":id")
  async handle(@Param("id") id: string, @CurrentUser() user: IAccessToken) {
    return this.getServicePlanUseCase.execute(id, user.personalId!);
  }
}
