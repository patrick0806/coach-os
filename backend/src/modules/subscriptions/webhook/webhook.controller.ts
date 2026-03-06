import { Controller, Headers, HttpCode, HttpStatus, Post, Req } from "@nestjs/common";
import { ApiOperation, ApiTags } from "@nestjs/swagger";
import { FastifyRequest } from "fastify";

import { Public } from "@shared/decorators";
import { API_TAGS } from "@shared/constants";

import { WebhookService } from "./webhook.service";

@Public()
@ApiTags(API_TAGS.SUBSCRIPTIONS)
@Controller({ version: "1", path: "webhook" })
export class WebhookController {
  constructor(private readonly webhookService: WebhookService) {}

  @Post()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Stripe webhook endpoint — validates stripe-signature header" })
  handle(
    @Req() req: FastifyRequest,
    @Headers("stripe-signature") signature: string,
  ): Promise<void> {
    return this.webhookService.execute(req.rawBody ?? Buffer.alloc(0), signature);
  }
}
