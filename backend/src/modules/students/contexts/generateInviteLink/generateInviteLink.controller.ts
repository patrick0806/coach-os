import { Body, Controller, HttpCode, HttpStatus, Post } from "@nestjs/common";
import { ApiOkResponse, ApiOperation, ApiTags } from "@nestjs/swagger";

import { API_TAGS } from "@shared/constants";
import { CurrentUser, Roles } from "@shared/decorators";
import { ApplicationRoles } from "@shared/enums";
import { IAccessToken } from "@shared/interfaces/accessToken.interface";

import { GenerateInviteLinkRequestDTO } from "./dtos/request.dto";
import { GenerateInviteLinkResponseDTO } from "./dtos/response.dto";
import { GenerateInviteLinkUseCase } from "./generateInviteLink.useCase";

@ApiTags(API_TAGS.STUDENTS)
@Roles(ApplicationRoles.PERSONAL)
@Controller({ version: "1" })
export class GenerateInviteLinkController {
  constructor(private readonly generateInviteLinkUseCase: GenerateInviteLinkUseCase) {}

  @ApiOperation({ summary: "Generate shareable invite link for a student" })
  @ApiOkResponse({ type: GenerateInviteLinkResponseDTO })
  @HttpCode(HttpStatus.OK)
  @Post("invite-link")
  async handle(@Body() body: GenerateInviteLinkRequestDTO, @CurrentUser() user: IAccessToken) {
    return this.generateInviteLinkUseCase.execute(body, user.personalId!);
  }
}
