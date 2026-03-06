import { Body, Controller, HttpCode, HttpStatus, Patch } from "@nestjs/common";
import { ApiOkResponse, ApiOperation, ApiTags } from "@nestjs/swagger";

import { CurrentUser, Roles } from "@shared/decorators";
import { ApplicationRoles } from "@shared/enums";
import { IAccessToken } from "@shared/interfaces";
import { API_TAGS } from "@shared/constants";
import { validate } from "@shared/utils";

import { UpdateProfileService } from "./update-profile.service";
import { UpdateProfileSchema } from "./dtos/request.dto";
import { GetProfileResponseDTO } from "../get-profile/dtos/response.dto";

@Roles(ApplicationRoles.PERSONAL)
@ApiTags(API_TAGS.PERSONALS)
@Controller({ version: "1", path: "me/profile" })
export class UpdateProfileController {
  constructor(private readonly updateProfileService: UpdateProfileService) {}

  @Patch()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Update personal trainer profile" })
  @ApiOkResponse({ type: GetProfileResponseDTO })
  async handle(
    @Body() body: unknown,
    @CurrentUser() user: IAccessToken,
  ): Promise<GetProfileResponseDTO> {
    const dto = validate(UpdateProfileSchema, body);
    return this.updateProfileService.execute(user.profileId, user.sub, dto);
  }
}
