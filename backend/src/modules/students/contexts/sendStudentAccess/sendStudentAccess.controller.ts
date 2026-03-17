import { Body, Controller, HttpCode, HttpStatus, Param, Post } from "@nestjs/common";
import { ApiOkResponse, ApiOperation, ApiTags } from "@nestjs/swagger";

import { API_TAGS } from "@shared/constants";
import { CurrentUser, Roles } from "@shared/decorators";
import { ApplicationRoles } from "@shared/enums";
import { IAccessToken } from "@shared/interfaces/accessToken.interface";

import { SendStudentAccessRequestDTO } from "./dtos/request.dto";
import { SendStudentAccessUseCase } from "./sendStudentAccess.useCase";

@ApiTags(API_TAGS.STUDENTS)
@Roles(ApplicationRoles.PERSONAL)
@Controller({ version: "1" })
export class SendStudentAccessController {
  constructor(private readonly sendStudentAccessUseCase: SendStudentAccessUseCase) {}

  @ApiOperation({ summary: "Send access setup link to an existing student" })
  @ApiOkResponse()
  @HttpCode(HttpStatus.OK)
  @Post(":id/send-access")
  async handle(
    @Param("id") studentId: string,
    @Body() body: SendStudentAccessRequestDTO,
    @CurrentUser() user: IAccessToken,
  ) {
    return this.sendStudentAccessUseCase.execute(studentId, user.personalId!, body.mode);
  }
}
