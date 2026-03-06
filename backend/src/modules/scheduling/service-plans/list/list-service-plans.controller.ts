import { Controller, Get } from "@nestjs/common";
import { ApiOkResponse, ApiOperation, ApiTags } from "@nestjs/swagger";

import { CurrentUser, Roles } from "@shared/decorators";
import { ApplicationRoles } from "@shared/enums";
import { IAccessToken } from "@shared/interfaces";
import { API_TAGS } from "@shared/constants";

import { ListServicePlansService } from "./list-service-plans.service";
import { ServicePlanDTO } from "../shared/dtos/service-plan.dto";

@Roles(ApplicationRoles.PERSONAL)
@ApiTags(API_TAGS.SERVICE_PLANS)
@Controller({ version: "1", path: "" })
export class ListServicePlansController {
  constructor(private readonly listServicePlansService: ListServicePlansService) {}

  @Get()
  @ApiOperation({ summary: "List service plans for the authenticated personal" })
  @ApiOkResponse({ type: [ServicePlanDTO] })
  handle(@CurrentUser() user: IAccessToken): Promise<ServicePlanDTO[]> {
    return this.listServicePlansService.execute(user);
  }
}
