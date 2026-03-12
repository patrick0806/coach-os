import { Body, Controller, HttpCode, HttpStatus, Param, Patch } from "@nestjs/common";
import { ApiOkResponse, ApiOperation, ApiTags } from "@nestjs/swagger";

import { CurrentUser, Roles } from "@shared/decorators";
import { ApplicationRoles } from "@shared/enums";
import { IAccessToken } from "@shared/interfaces";

import { CancelTrainingSessionService } from "./cancel-training-session.service";
import { CancelTrainingSessionDTO } from "./dtos/request.dto";
import { TrainingSessionDTO } from "../../shared/dtos/training-session.dto";

@Roles(ApplicationRoles.PERSONAL, ApplicationRoles.STUDENT)
@ApiTags("Training Schedule")
@Controller({ version: "1", path: "training-sessions" })
export class CancelTrainingSessionController {
  constructor(private readonly service: CancelTrainingSessionService) {}

  @Patch(":id/cancel")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Cancela uma sessão de treino específica" })
  @ApiOkResponse({ type: TrainingSessionDTO })
  handle(
    @Param("id") id: string,
    @Body() dto: CancelTrainingSessionDTO,
    @CurrentUser() user: IAccessToken,
  ): Promise<TrainingSessionDTO> {
    return this.service.execute(id, dto, user);
  }
}
