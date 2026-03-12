import { Controller, Get, HttpCode, HttpStatus } from "@nestjs/common";
import { ApiOkResponse, ApiOperation, ApiTags } from "@nestjs/swagger";

import { CurrentUser, Roles } from "@shared/decorators";
import { ApplicationRoles } from "@shared/enums";
import { IAccessToken } from "@shared/interfaces";

import { WeekSessionsService } from "./week-sessions.service";
import { TrainingSessionDTO } from "../../shared/dtos/training-session.dto";

@Roles(ApplicationRoles.STUDENT)
@ApiTags("Training Schedule")
@Controller({ version: "1", path: "training-sessions" })
export class WeekSessionsController {
  constructor(private readonly service: WeekSessionsService) {}

  @Get("week")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Retorna as sessões dos próximos 7 dias do aluno autenticado" })
  @ApiOkResponse({ type: [TrainingSessionDTO] })
  handle(@CurrentUser() user: IAccessToken): Promise<TrainingSessionDTO[]> {
    return this.service.execute(user);
  }
}
