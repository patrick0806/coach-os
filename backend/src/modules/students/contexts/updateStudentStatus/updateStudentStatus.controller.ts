import { Body, Controller, HttpCode, HttpStatus, Param, Patch } from "@nestjs/common";
import { ApiNoContentResponse, ApiOperation, ApiTags } from "@nestjs/swagger";

import { API_TAGS } from "@shared/constants";
import { CurrentUser, Roles } from "@shared/decorators";
import { ApplicationRoles } from "@shared/enums";
import { IAccessToken } from "@shared/interfaces/accessToken.interface";

import { UpdateStudentStatusRequestDTO } from "./dtos/request.dto";
import { UpdateStudentStatusUseCase } from "./updateStudentStatus.useCase";

@ApiTags(API_TAGS.STUDENTS)
@Roles(ApplicationRoles.PERSONAL)
@Controller({ version: "1" })
export class UpdateStudentStatusController {
  constructor(private readonly updateStudentStatusUseCase: UpdateStudentStatusUseCase) {}

  @ApiOperation({ summary: "Update student status" })
  @ApiNoContentResponse()
  @HttpCode(HttpStatus.NO_CONTENT)
  @Patch(":id/status")
  async handle(
    @Param("id") id: string,
    @Body() body: UpdateStudentStatusRequestDTO,
    @CurrentUser() user: IAccessToken,
  ) {
    await this.updateStudentStatusUseCase.execute(id, body, user.personalId!);
  }
}
