import { Controller, Get, Query } from "@nestjs/common";
import { ApiOkResponse, ApiOperation, ApiQuery, ApiTags } from "@nestjs/swagger";

import { Roles } from "@shared/decorators";
import { ApplicationRoles } from "@shared/enums";
import { API_TAGS } from "@shared/constants";

import { GetChartsService } from "./get-charts.service";
import { ChartsDTO } from "./dtos/response.dto";
import { PeriodFilter } from "../get-stats/get-stats.service";

@Roles(ApplicationRoles.ADMIN)
@ApiTags(API_TAGS.ADMIN)
@Controller({ version: "1", path: "dashboard" })
export class GetChartsController {
  constructor(private readonly getChartsService: GetChartsService) {}

  @Get("charts")
  @ApiOperation({ summary: "Get chart data for admin dashboard" })
  @ApiOkResponse({ type: ChartsDTO })
  @ApiQuery({ name: "period", enum: ["7d", "30d", "90d", "all"], required: false })
  handle(@Query("period") period: string = "30d"): Promise<ChartsDTO> {
    const validPeriods: PeriodFilter[] = ["7d", "30d", "90d", "all"];
    const filter: PeriodFilter = validPeriods.includes(period as PeriodFilter)
      ? (period as PeriodFilter)
      : "30d";
    return this.getChartsService.execute(filter);
  }
}
