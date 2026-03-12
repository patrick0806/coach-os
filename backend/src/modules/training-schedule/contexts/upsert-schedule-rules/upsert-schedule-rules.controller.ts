import { Body, Controller, HttpCode, HttpStatus, Param, Put } from "@nestjs/common";
import { ApiOkResponse, ApiOperation, ApiTags } from "@nestjs/swagger";

import { CurrentUser, Roles } from "@shared/decorators";
import { ApplicationRoles } from "@shared/enums";
import { IAccessToken } from "@shared/interfaces";

import { UpsertScheduleRulesService } from "./upsert-schedule-rules.service";
import { UpsertScheduleRulesDTO } from "./dtos/request.dto";
import { ScheduleRuleDTO } from "../../shared/dtos/training-session.dto";

@Roles(ApplicationRoles.PERSONAL)
@ApiTags("Training Schedule")
@Controller({ version: "1", path: "students/:studentId/schedule-rules" })
export class UpsertScheduleRulesController {
  constructor(private readonly service: UpsertScheduleRulesService) {}

  @Put()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Define ou atualiza o planejador semanal de um aluno" })
  @ApiOkResponse({ type: [ScheduleRuleDTO] })
  handle(
    @Param("studentId") studentId: string,
    @Body() dto: UpsertScheduleRulesDTO,
    @CurrentUser() user: IAccessToken,
  ): Promise<ScheduleRuleDTO[]> {
    return this.service.execute(dto, studentId, user);
  }
}
