import { Body, Controller, HttpCode, HttpStatus, Post } from "@nestjs/common";
import { ApiCreatedResponse, ApiOperation, ApiTags } from "@nestjs/swagger";
import { Throttle } from "@nestjs/throttler";

import { API_TAGS } from "@shared/constants";
import { Public } from "@shared/decorators";
import { BypassTenantAccess } from "@shared/decorators/bypass-tenant-access.decorator";

import { JoinWaitlistUseCase } from "./joinWaitlist.useCase";
import { JoinWaitlistResponseDTO } from "./dtos/response.dto";

@Public()
@BypassTenantAccess()
@Throttle({
  short: { ttl: 60_000, limit: process.env.NODE_ENV !== "production" ? 30 : 3 },
  long: { ttl: 600_000, limit: process.env.NODE_ENV !== "production" ? 100 : 5 },
})
@ApiTags(API_TAGS.SUPPORT)
@Controller({ version: "1" })
export class JoinWaitlistController {
  constructor(private readonly joinWaitlistUseCase: JoinWaitlistUseCase) {}

  @ApiOperation({ summary: "Join the waitlist" })
  @ApiCreatedResponse({ type: JoinWaitlistResponseDTO })
  @Post("join")
  @HttpCode(HttpStatus.CREATED)
  async handle(@Body() body: unknown): Promise<{ message: string }> {
    return this.joinWaitlistUseCase.execute(body);
  }
}
