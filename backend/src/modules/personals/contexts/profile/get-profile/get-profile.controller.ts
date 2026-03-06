import { Controller, Get } from "@nestjs/common";
import { ApiOkResponse, ApiOperation, ApiTags } from "@nestjs/swagger";

import { CurrentUser, Roles } from "@shared/decorators";
import { ApplicationRoles } from "@shared/enums";
import { IAccessToken } from "@shared/interfaces";
import { API_TAGS } from "@shared/constants";

import { GetProfileService } from "./get-profile.service";
import { GetProfileResponseDTO } from "./dtos/response.dto";

@Roles(ApplicationRoles.PERSONAL)
@ApiTags(API_TAGS.PERSONALS)
@Controller({ version: "1", path: "me/profile" })
export class GetProfileController {
  constructor(private readonly getProfileService: GetProfileService) {}

  @Get()
  @ApiOperation({ summary: "Get authenticated personal trainer profile" })
  @ApiOkResponse({ type: GetProfileResponseDTO })
  handle(@CurrentUser() user: IAccessToken): Promise<GetProfileResponseDTO> {
    return this.getProfileService.execute(user.sub);
  }
}
