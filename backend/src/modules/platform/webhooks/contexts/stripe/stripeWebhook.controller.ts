import { Controller, Headers, Post, Req } from "@nestjs/common";
import { ApiOperation, ApiTags } from "@nestjs/swagger";
import { FastifyRequest } from "fastify";

import { API_TAGS } from "@shared/constants";
import { Public } from "@shared/decorators";

import { ProcessStripeEventUseCase } from "./processStripeEvent.useCase";

@Public()
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
    const rawBody = (req as FastifyRequest & { rawBody?: Buffer }).rawBody ?? Buffer.alloc(0);
    await this.processStripeEventUseCase.execute(rawBody, signature);
    return { received: true };
  }
}
