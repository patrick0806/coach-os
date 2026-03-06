import { Body, Controller, HttpCode, HttpStatus, Post } from "@nestjs/common";
import { ApiCreatedResponse, ApiOperation, ApiTags } from "@nestjs/swagger";

import { Roles } from "@shared/decorators";
import { ApplicationRoles } from "@shared/enums";
import { API_TAGS } from "@shared/constants";

import { CreatePlanService } from "./create-plan.service";
import { CreatePlanDTO } from "./dtos/request.dto";

@Roles(ApplicationRoles.ADMIN)
@ApiTags(API_TAGS.ADMIN)
@Controller({ version: "1", path: "plans" })
export class CreatePlanController {
  constructor(private readonly createPlanService: CreatePlanService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: "Create a new SaaS plan (admin only)" })
  @ApiCreatedResponse()
  handle(@Body() dto: CreatePlanDTO) {
    return this.createPlanService.execute(dto);
  }
}
