import { Controller, Get } from "@nestjs/common";
import { ApiOkResponse, ApiOperation, ApiTags } from "@nestjs/swagger";

import { Public } from "@shared/decorators";
import { API_TAGS } from "@shared/constants";

import { ListPlansService } from "./list-plans.service";
import { PlanDTO } from "./dtos/response.dto";

@Public()
@ApiTags(API_TAGS.PLANS)
@Controller({ version: "1", path: "" })
export class ListPlansController {
  constructor(private readonly listPlansService: ListPlansService) {}

  @Get()
  @ApiOperation({ summary: "List all active SaaS plans ordered by display order" })
  @ApiOkResponse({ type: [PlanDTO] })
  handle(): Promise<PlanDTO[]> {
    return this.listPlansService.execute();
  }
}
