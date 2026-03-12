import { Controller, Get, HttpCode, HttpStatus, Query } from "@nestjs/common";
import { ApiOkResponse, ApiOperation, ApiTags } from "@nestjs/swagger";

import { CurrentUser, Roles } from "@shared/decorators";
import { ApplicationRoles } from "@shared/enums";
import { IAccessToken } from "@shared/interfaces";

import { PersonalCalendarService } from "./personal-calendar.service";
import { PersonalCalendarQueryDTO } from "./dtos/request.dto";
import { CalendarSessionDTO } from "./dtos/response.dto";

@Roles(ApplicationRoles.PERSONAL)
@ApiTags("Training Schedule")
@Controller({ version: "1", path: "training-sessions/personal-calendar" })
export class PersonalCalendarController {
  constructor(private readonly service: PersonalCalendarService) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Lista todas as sessões de treino do personal em um intervalo de datas, com nome do aluno" })
  @ApiOkResponse({ type: [CalendarSessionDTO] })
  handle(
    @Query() query: PersonalCalendarQueryDTO,
    @CurrentUser() user: IAccessToken,
  ): Promise<CalendarSessionDTO[]> {
    return this.service.execute(query, user);
  }
}
