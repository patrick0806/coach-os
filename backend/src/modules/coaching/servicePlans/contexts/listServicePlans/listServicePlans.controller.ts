import { Controller, Get, HttpCode, HttpStatus } from "@nestjs/common";
import { ApiOkResponse, ApiOperation, ApiTags } from "@nestjs/swagger";

import { API_TAGS } from "@shared/constants";
import { CurrentUser, Roles } from "@shared/decorators";
import { ApplicationRoles } from "@shared/enums";
import { IAccessToken } from "@shared/interfaces/accessToken.interface";

import { CreateServicePlanResponseDTO } from "../createServicePlan/dtos/response.dto";
import { ListServicePlansUseCase } from "./listServicePlans.useCase";

@ApiTags(API_TAGS.SERVICE_PLANS)
@Roles(ApplicationRoles.PERSONAL)
@Controller({ version: "1", path: "service-plans" })
export class ListServicePlansController {
  constructor(private readonly listServicePlansUseCase: ListServicePlansUseCase) {}

  @ApiOperation({ summary: "List all service plans" })
  @ApiOkResponse({ type: [CreateServicePlanResponseDTO] })
  @HttpCode(HttpStatus.OK)
  @Get()
  async handle(@CurrentUser() user: IAccessToken) {
    return this.listServicePlansUseCase.execute(user.personalId!);
  }
}
