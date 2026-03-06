import { Controller, Get, Param } from "@nestjs/common";
import { ApiOkResponse, ApiOperation, ApiParam, ApiTags } from "@nestjs/swagger";

import { Public } from "@shared/decorators";
import { API_TAGS } from "@shared/constants";

import { GetPublicProfileService } from "./get-public-profile.service";
import { GetPublicProfileResponseDTO } from "./dtos/response.dto";

@Public()
@ApiTags(API_TAGS.PERSONALS)
@Controller({ version: "1", path: ":slug/public" })
export class GetPublicProfileController {
  constructor(
    private readonly getPublicProfileService: GetPublicProfileService,
  ) {}

  @Get()
  @ApiOperation({ summary: "Get public profile of a personal trainer by slug" })
  @ApiParam({ name: "slug", description: "Personal trainer slug" })
  @ApiOkResponse({ type: GetPublicProfileResponseDTO })
  handle(@Param("slug") slug: string): Promise<GetPublicProfileResponseDTO> {
    return this.getPublicProfileService.execute(slug);
  }
}
