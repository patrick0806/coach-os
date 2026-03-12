import { Body, Controller, HttpCode, HttpStatus, Param, Patch } from "@nestjs/common";
import { ApiOkResponse, ApiOperation, ApiTags } from "@nestjs/swagger";

import { CurrentUser, Roles } from "@shared/decorators";
import { ApplicationRoles } from "@shared/enums";
import { IAccessToken } from "@shared/interfaces";

import { CompleteTrainingSessionService } from "./complete-training-session.service";
import { TrainingSessionDTO } from "../../shared/dtos/training-session.dto";

export class CompleteTrainingSessionDTO {
  workoutSessionId?: string;
}

@Roles(ApplicationRoles.STUDENT)
@ApiTags("Training Schedule")
@Controller({ version: "1", path: "training-sessions" })
export class CompleteTrainingSessionController {
  constructor(private readonly service: CompleteTrainingSessionService) {}

  @Patch(":id/complete")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Marca uma sessão de treino como concluída" })
  @ApiOkResponse({ type: TrainingSessionDTO })
  handle(
    @Param("id") id: string,
    @Body() dto: CompleteTrainingSessionDTO,
    @CurrentUser() user: IAccessToken,
  ): Promise<TrainingSessionDTO> {
    return this.service.execute(id, user, dto.workoutSessionId);
  }
}
