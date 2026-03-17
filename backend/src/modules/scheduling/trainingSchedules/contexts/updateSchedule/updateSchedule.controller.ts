import { Body, Controller, HttpCode, HttpStatus, Param, Put } from "@nestjs/common";
import {
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from "@nestjs/swagger";

import { API_TAGS } from "@shared/constants";
import { CurrentUser, Roles } from "@shared/decorators";
import { ApplicationRoles } from "@shared/enums";
import { IAccessToken } from "@shared/interfaces/accessToken.interface";

import { UpdateTrainingScheduleRequestDTO } from "./dtos/request.dto";
import { UpdateTrainingScheduleResponseDTO } from "./dtos/response.dto";
import { UpdateTrainingScheduleUseCase } from "./updateSchedule.useCase";

@ApiTags(API_TAGS.TRAINING_SCHEDULE)
@Roles(ApplicationRoles.PERSONAL)
@Controller({ version: "1", path: "training-schedules" })
export class UpdateTrainingScheduleController {
  constructor(
    private readonly updateTrainingScheduleUseCase: UpdateTrainingScheduleUseCase,
  ) {}

  @ApiOperation({ summary: "Update a training schedule" })
  @ApiOkResponse({ type: UpdateTrainingScheduleResponseDTO })
  @ApiNotFoundResponse({ description: "Training schedule not found" })
  @HttpCode(HttpStatus.OK)
  @Put(":id")
  async handle(
    @Param("id") id: string,
    @Body() body: UpdateTrainingScheduleRequestDTO,
    @CurrentUser() user: IAccessToken,
  ) {
    return this.updateTrainingScheduleUseCase.execute(
      id,
      body,
      user.personalId!,
    );
  }
}
