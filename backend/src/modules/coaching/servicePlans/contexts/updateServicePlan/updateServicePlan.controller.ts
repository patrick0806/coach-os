import { Body, Controller, HttpCode, HttpStatus, Param, Put } from "@nestjs/common";
import { ApiOkResponse, ApiOperation, ApiTags } from "@nestjs/swagger";

import { API_TAGS } from "@shared/constants";
import { CurrentUser, Roles } from "@shared/decorators";
import { ApplicationRoles } from "@shared/enums";
import { IAccessToken } from "@shared/interfaces/accessToken.interface";

import { CreateServicePlanResponseDTO } from "../createServicePlan/dtos/response.dto";
import { UpdateServicePlanRequestDTO } from "./dtos/request.dto";
import { UpdateServicePlanUseCase } from "./updateServicePlan.useCase";

@ApiTags(API_TAGS.SERVICE_PLANS)
@Roles(ApplicationRoles.PERSONAL)
@Controller({ version: "1", path: "service-plans" })
export class UpdateServicePlanController {
  constructor(private readonly updateServicePlanUseCase: UpdateServicePlanUseCase) {}

  @ApiOperation({ summary: "Update a service plan" })
  @ApiOkResponse({ type: CreateServicePlanResponseDTO })
  @HttpCode(HttpStatus.OK)
  @Put(":id")
  async handle(
    @Param("id") id: string,
    @Body() body: UpdateServicePlanRequestDTO,
    @CurrentUser() user: IAccessToken,
  ) {
    return this.updateServicePlanUseCase.execute(id, body, user.personalId!);
  }
}
