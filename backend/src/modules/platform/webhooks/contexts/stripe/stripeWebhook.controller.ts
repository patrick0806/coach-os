import { BadRequestException, Controller, Headers, Post, Req } from "@nestjs/common";
import { ApiOperation, ApiTags } from "@nestjs/swagger";
import { SkipThrottle } from "@nestjs/throttler";
import { FastifyRequest } from "fastify";

import { API_TAGS } from "@shared/constants";
import { Public } from "@shared/decorators";

import { ProcessStripeEventUseCase } from "./processStripeEvent.useCase";

@Public()
@SkipThrottle()
@ApiTags(API_TAGS.SUBSCRIPTIONS)
@Controller({ version: "1" })
export class StripeWebhookController {
  constructor(private readonly processStripeEventUseCase: ProcessStripeEventUseCase) {}

  @ApiOperation({ summary: "Stripe webhook endpoint" })
  @Post("stripe")
  async handle(
    @Req() req: FastifyRequest,
    @Headers("stripe-signature") signature: string,
  ) {
    const rawBody = (req as FastifyRequest & { rawBody?: Buffer }).rawBody;
    if (!rawBody || rawBody.length === 0) {
      throw new BadRequestException("Missing request body");
    }
    await this.processStripeEventUseCase.execute(rawBody, signature);
    return { received: true };
  }
}
