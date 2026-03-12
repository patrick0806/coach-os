import { Controller, Get, HttpCode, HttpStatus, Param } from "@nestjs/common";
import { ApiOkResponse, ApiOperation, ApiTags } from "@nestjs/swagger";

import { CurrentUser, Roles } from "@shared/decorators";
import { ApplicationRoles } from "@shared/enums";
import { IAccessToken } from "@shared/interfaces";

import { GetScheduleRulesService } from "./get-schedule-rules.service";
import { ScheduleRuleDTO } from "../../shared/dtos/training-session.dto";

@Roles(ApplicationRoles.PERSONAL)
@ApiTags("Training Schedule")
@Controller({ version: "1", path: "students/:studentId/schedule-rules" })
export class GetScheduleRulesController {
  constructor(private readonly service: GetScheduleRulesService) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Lista as regras de agenda semanal de um aluno" })
  @ApiOkResponse({ type: [ScheduleRuleDTO] })
  handle(
    @Param("studentId") studentId: string,
    @CurrentUser() user: IAccessToken,
  ): Promise<ScheduleRuleDTO[]> {
    return this.service.execute(studentId, user);
  }
}
