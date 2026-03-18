import { Body, Controller, HttpCode, HttpStatus, Put } from "@nestjs/common";
import { ApiOkResponse, ApiOperation, ApiTags } from "@nestjs/swagger";

import { API_TAGS } from "@shared/constants";
import { CurrentUser, Roles } from "@shared/decorators";
import { ApplicationRoles } from "@shared/enums";
import { IAccessToken } from "@shared/interfaces/accessToken.interface";

import { UpdateProfileRequestDTO } from "./dtos/request.dto";
import { UpdateProfileUseCase } from "./updateProfile.useCase";

@ApiTags(API_TAGS.PERSONALS)
@Roles(ApplicationRoles.PERSONAL)
@Controller({ version: "1" })
export class UpdateProfileController {
  constructor(private readonly updateProfileUseCase: UpdateProfileUseCase) {}

  @ApiOperation({ summary: "Update the authenticated coach profile" })
  @ApiOkResponse()
  @HttpCode(HttpStatus.OK)
  @Put()
  async handle(@Body() body: UpdateProfileRequestDTO, @CurrentUser() user: IAccessToken) {
    return this.updateProfileUseCase.execute(user.personalId!, body);
  }
}
