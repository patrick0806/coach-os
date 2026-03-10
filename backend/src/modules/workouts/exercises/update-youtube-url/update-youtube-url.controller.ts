import { Body, Controller, HttpCode, HttpStatus, Param, Patch } from "@nestjs/common";
import { ApiOkResponse, ApiOperation, ApiTags } from "@nestjs/swagger";

import { CurrentUser, Roles } from "@shared/decorators";
import { ApplicationRoles } from "@shared/enums";
import { IAccessToken } from "@shared/interfaces";
import { API_TAGS } from "@shared/constants";

import { UpdateYoutubeUrlService } from "./update-youtube-url.service";
import { UpdateYoutubeUrlDTO } from "./dtos/request.dto";

class UpdateYoutubeUrlResponseDTO {
  youtubeUrl: string | null;
}

@Roles(ApplicationRoles.PERSONAL)
@ApiTags(API_TAGS.EXERCISES)
@Controller({ version: "1", path: "" })
export class UpdateYoutubeUrlController {
  constructor(private readonly updateYoutubeUrlService: UpdateYoutubeUrlService) {}

  @Patch(":id/youtube-url")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Update YouTube URL of an owned custom exercise" })
  @ApiOkResponse({ type: UpdateYoutubeUrlResponseDTO })
  handle(
    @Param("id") id: string,
    @Body() dto: UpdateYoutubeUrlDTO,
    @CurrentUser() user: IAccessToken,
  ): Promise<{ youtubeUrl: string | null }> {
    return this.updateYoutubeUrlService.execute(id, dto, user);
  }
}
