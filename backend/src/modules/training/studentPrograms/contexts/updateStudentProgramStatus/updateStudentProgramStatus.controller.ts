import { Body, Controller, HttpCode, HttpStatus, Param, Patch } from "@nestjs/common";
import { ApiOkResponse, ApiOperation, ApiTags } from "@nestjs/swagger";

import { API_TAGS } from "@shared/constants";
import { CurrentUser, Roles } from "@shared/decorators";
import { ApplicationRoles } from "@shared/enums";
import { IAccessToken } from "@shared/interfaces/accessToken.interface";

import { UpdateStudentProgramStatusRequestDTO } from "./dtos/request.dto";
import { UpdateStudentProgramStatusUseCase } from "./updateStudentProgramStatus.useCase";

@ApiTags(API_TAGS.WORKOUT_PLANS)
@Roles(ApplicationRoles.PERSONAL)
@Controller({ version: "1" })
export class UpdateStudentProgramStatusController {
  constructor(
    private readonly updateStudentProgramStatusUseCase: UpdateStudentProgramStatusUseCase,
  ) {}

  @ApiOperation({ summary: "Update the status of a student program" })
  @ApiOkResponse()
  @HttpCode(HttpStatus.OK)
  @Patch(":id/status")
  async handle(
    @Param("id") id: string,
    @Body() body: UpdateStudentProgramStatusRequestDTO,
    @CurrentUser() user: IAccessToken,
  ) {
    return this.updateStudentProgramStatusUseCase.execute(id, body, user.personalId!);
  }
}
