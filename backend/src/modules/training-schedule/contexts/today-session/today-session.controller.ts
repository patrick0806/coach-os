import { Controller, Get, HttpCode, HttpStatus } from "@nestjs/common";
import { ApiOkResponse, ApiOperation, ApiTags } from "@nestjs/swagger";

import { CurrentUser, Roles } from "@shared/decorators";
import { ApplicationRoles } from "@shared/enums";
import { IAccessToken } from "@shared/interfaces";

import { TodaySessionService } from "./today-session.service";
import { TrainingSessionDTO } from "../../shared/dtos/training-session.dto";

@Roles(ApplicationRoles.STUDENT)
@ApiTags("Training Schedule")
@Controller({ version: "1", path: "training-sessions" })
export class TodaySessionController {
  constructor(private readonly service: TodaySessionService) {}

  @Get("today")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Retorna o treino de hoje do aluno autenticado" })
  @ApiOkResponse({ type: TrainingSessionDTO })
  handle(@CurrentUser() user: IAccessToken): Promise<TrainingSessionDTO | null> {
    return this.service.execute(user);
  }
}
