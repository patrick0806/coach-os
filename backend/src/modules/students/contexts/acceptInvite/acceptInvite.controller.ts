import { Body, Controller, HttpCode, HttpStatus, Post } from "@nestjs/common";
import { ApiOkResponse, ApiOperation, ApiTags } from "@nestjs/swagger";

import { API_TAGS } from "@shared/constants";
import { BypassTenantAccess, Public } from "@shared/decorators";

import { AcceptInviteRequestDTO } from "./dtos/request.dto";
import { AcceptInviteUseCase } from "./acceptInvite.useCase";

@Public()
@BypassTenantAccess()
@ApiTags(API_TAGS.STUDENTS)
@Controller({ version: "1" })
export class AcceptInviteController {
  constructor(private readonly acceptInviteUseCase: AcceptInviteUseCase) {}

  @ApiOperation({ summary: "Accept student invitation and create account" })
  @ApiOkResponse({ schema: { properties: { message: { type: "string" } } } })
  @HttpCode(HttpStatus.OK)
  @Post("accept-invite")
  async handle(@Body() body: AcceptInviteRequestDTO) {
    return this.acceptInviteUseCase.execute(body);
  }
}
