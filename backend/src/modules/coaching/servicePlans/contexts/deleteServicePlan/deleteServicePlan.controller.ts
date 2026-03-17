import { Controller, Delete, HttpCode, HttpStatus, Param } from "@nestjs/common";
import { ApiNoContentResponse, ApiOperation, ApiTags } from "@nestjs/swagger";

import { API_TAGS } from "@shared/constants";
import { CurrentUser, Roles } from "@shared/decorators";
import { ApplicationRoles } from "@shared/enums";
import { IAccessToken } from "@shared/interfaces/accessToken.interface";

import { DeleteServicePlanUseCase } from "./deleteServicePlan.useCase";

@ApiTags(API_TAGS.SERVICE_PLANS)
@Roles(ApplicationRoles.PERSONAL)
@Controller({ version: "1", path: "service-plans" })
export class DeleteServicePlanController {
  constructor(private readonly deleteServicePlanUseCase: DeleteServicePlanUseCase) {}

  @ApiOperation({ summary: "Delete a service plan" })
  @ApiNoContentResponse()
  @HttpCode(HttpStatus.NO_CONTENT)
  @Delete(":id")
  async handle(@Param("id") id: string, @CurrentUser() user: IAccessToken) {
    return this.deleteServicePlanUseCase.execute(id, user.personalId!);
  }
}
