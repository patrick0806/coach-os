import { Body, Controller, HttpCode, HttpStatus, Param, Put } from "@nestjs/common";
import { ApiOkResponse, ApiOperation, ApiTags } from "@nestjs/swagger";

import { API_TAGS } from "@shared/constants";
import { CurrentUser, Roles } from "@shared/decorators";
import { ApplicationRoles } from "@shared/enums";
import { IAccessToken } from "@shared/interfaces/accessToken.interface";

import { UpdateWorkoutTemplateRequestDTO } from "./dtos/request.dto";
import { UpdateWorkoutTemplateResponseDTO } from "./dtos/response.dto";
import { UpdateWorkoutTemplateUseCase } from "./updateWorkoutTemplate.useCase";

@ApiTags(API_TAGS.WORKOUT_PLANS)
@Roles(ApplicationRoles.PERSONAL)
@Controller({ version: "1" })
export class UpdateWorkoutTemplateController {
  constructor(
    private readonly updateWorkoutTemplateUseCase: UpdateWorkoutTemplateUseCase,
  ) {}

  @ApiOperation({ summary: "Update a workout template" })
  @ApiOkResponse({ type: UpdateWorkoutTemplateResponseDTO })
  @HttpCode(HttpStatus.OK)
  @Put(":id")
  async handle(
    @Param("id") id: string,
    @Body() body: UpdateWorkoutTemplateRequestDTO,
    @CurrentUser() user: IAccessToken,
  ) {
    return this.updateWorkoutTemplateUseCase.execute(id, body, user.personalId!);
  }
}
