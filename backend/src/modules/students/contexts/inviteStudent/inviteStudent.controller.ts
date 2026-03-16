import { Body, Controller, HttpCode, HttpStatus, Post } from "@nestjs/common";
import { ApiOkResponse, ApiOperation, ApiTags } from "@nestjs/swagger";

import { API_TAGS } from "@shared/constants";
import { CurrentUser, Roles } from "@shared/decorators";
import { ApplicationRoles } from "@shared/enums";
import { IAccessToken } from "@shared/interfaces/accessToken.interface";

import { InviteStudentRequestDTO } from "./dtos/request.dto";
import { InviteStudentUseCase } from "./inviteStudent.useCase";

@ApiTags(API_TAGS.STUDENTS)
@Roles(ApplicationRoles.PERSONAL)
@Controller({ version: "1" })
export class InviteStudentController {
  constructor(private readonly inviteStudentUseCase: InviteStudentUseCase) {}

  @ApiOperation({ summary: "Send email invitation to a student" })
  @ApiOkResponse({ schema: { properties: { message: { type: "string" } } } })
  @HttpCode(HttpStatus.OK)
  @Post("invite")
  async handle(@Body() body: InviteStudentRequestDTO, @CurrentUser() user: IAccessToken) {
    return this.inviteStudentUseCase.execute(body, user.personalId!);
  }
}
