import { Controller, Get, HttpCode, HttpStatus, Query } from "@nestjs/common";
import { ApiOkResponse, ApiOperation, ApiQuery, ApiTags } from "@nestjs/swagger";

import { CurrentUser, Roles } from "@shared/decorators";
import { ApplicationRoles } from "@shared/enums";
import { IAccessToken } from "@shared/interfaces";

import { ActivityHistoryService } from "./activity-history.service";
import { TrainingSessionDTO } from "../../shared/dtos/training-session.dto";

@Roles(ApplicationRoles.STUDENT)
@ApiTags("Training Schedule")
@Controller({ version: "1", path: "training-sessions" })
export class ActivityHistoryController {
  constructor(private readonly service: ActivityHistoryService) {}

  @Get("history")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Retorna o histórico de sessões de treino dos últimos N dias" })
  @ApiQuery({ name: "days", required: false, type: Number, example: 84 })
  @ApiOkResponse({ type: [TrainingSessionDTO] })
  handle(
    @Query("days") days: string,
    @CurrentUser() user: IAccessToken,
  ): Promise<TrainingSessionDTO[]> {
    const parsedDays = days ? parseInt(days, 10) : 84;
    return this.service.execute(user, parsedDays);
  }
}
