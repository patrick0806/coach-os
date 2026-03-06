import { Controller, Get, Query } from "@nestjs/common";
import { ApiOkResponse, ApiOperation, ApiQuery, ApiTags } from "@nestjs/swagger";

import { Roles } from "@shared/decorators";
import { ApplicationRoles } from "@shared/enums";
import { API_TAGS } from "@shared/constants";

import { GetStatsService, PeriodFilter } from "./get-stats.service";
import { StatsDTO } from "./dtos/response.dto";

@Roles(ApplicationRoles.ADMIN)
@ApiTags(API_TAGS.ADMIN)
@Controller({ version: "1", path: "dashboard" })
export class GetStatsController {
  constructor(private readonly getStatsService: GetStatsService) {}

  @Get("stats")
  @ApiOperation({ summary: "Get KPI stats for admin dashboard" })
  @ApiOkResponse({ type: StatsDTO })
  @ApiQuery({ name: "period", enum: ["7d", "30d", "90d", "all"], required: false })
  handle(@Query("period") period: string = "30d"): Promise<StatsDTO> {
    const validPeriods: PeriodFilter[] = ["7d", "30d", "90d", "all"];
    const filter: PeriodFilter = validPeriods.includes(period as PeriodFilter)
      ? (period as PeriodFilter)
      : "30d";
    return this.getStatsService.execute(filter);
  }
}
