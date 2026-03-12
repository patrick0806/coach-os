import { Controller, Get, HttpCode, HttpStatus, Param, Query } from "@nestjs/common";
import { ApiOkResponse, ApiOperation, ApiTags } from "@nestjs/swagger";

import { CurrentUser, Roles } from "@shared/decorators";
import { ApplicationRoles } from "@shared/enums";
import { IAccessToken } from "@shared/interfaces";

import { ListTrainingSessionsService } from "./list-training-sessions.service";
import { ListTrainingSessionsQueryDTO } from "./dtos/request.dto";
import { TrainingSessionDTO } from "../../shared/dtos/training-session.dto";

@Roles(ApplicationRoles.PERSONAL)
@ApiTags("Training Schedule")
@Controller({ version: "1", path: "students/:studentId/training-sessions" })
export class ListTrainingSessionsController {
  constructor(private readonly service: ListTrainingSessionsService) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Lista as sessões de treino de um aluno em um intervalo de datas" })
  @ApiOkResponse({ type: [TrainingSessionDTO] })
  handle(
    @Param("studentId") studentId: string,
    @Query() query: ListTrainingSessionsQueryDTO,
    @CurrentUser() user: IAccessToken,
  ): Promise<TrainingSessionDTO[]> {
    return this.service.execute(studentId, query, user);
  }
}
