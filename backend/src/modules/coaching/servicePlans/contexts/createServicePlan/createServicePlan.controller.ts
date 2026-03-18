import { Body, Controller, HttpCode, HttpStatus, Post } from "@nestjs/common";
import { ApiCreatedResponse, ApiOperation, ApiTags } from "@nestjs/swagger";

import { API_TAGS } from "@shared/constants";
import { CurrentUser, Roles } from "@shared/decorators";
import { ApplicationRoles } from "@shared/enums";
import { IAccessToken } from "@shared/interfaces/accessToken.interface";

import { CreateServicePlanRequestDTO } from "./dtos/request.dto";
import { CreateServicePlanResponseDTO } from "./dtos/response.dto";
import { CreateServicePlanUseCase } from "./createServicePlan.useCase";

@ApiTags(API_TAGS.SERVICE_PLANS)
@Roles(ApplicationRoles.PERSONAL)
@Controller({ version: "1", path: "" })
export class CreateServicePlanController {
  constructor(private readonly createServicePlanUseCase: CreateServicePlanUseCase) { }

  @ApiOperation({ summary: "Create a service plan" })
  @ApiCreatedResponse({ type: CreateServicePlanResponseDTO })
  @HttpCode(HttpStatus.CREATED)
  @Post()
  async handle(@Body() body: CreateServicePlanRequestDTO, @CurrentUser() user: IAccessToken) {
    return this.createServicePlanUseCase.execute(body, user.personalId!);
  }
}
