import { Controller, Get, HttpCode, HttpStatus, Param } from "@nestjs/common";
import { ApiOkResponse, ApiOperation, ApiTags } from "@nestjs/swagger";

import { BypassTenantAccess, Public } from "@shared/decorators";

import { GetPublicProfileUseCase } from "./getPublicProfile.useCase";

@ApiTags("Public")
@Public()
@BypassTenantAccess()
@Controller({ version: "1", path: "" })
export class GetPublicProfileController {
  constructor(private readonly getPublicProfileUseCase: GetPublicProfileUseCase) { }

  @ApiOperation({ summary: "Get public coach profile by slug" })
  @ApiOkResponse()
  @HttpCode(HttpStatus.OK)
  @Get(":slug")
  async handle(@Param("slug") slug: string) {
    return this.getPublicProfileUseCase.execute(slug);
  }
}
