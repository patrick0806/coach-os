import { Injectable } from "@nestjs/common";
import Stripe from "stripe";

import { env } from "@config/env";
import { logger } from "@config/pino.config";

@Injectable()
export class StripeProvider {
  readonly client: Stripe | null;

  constructor() {
    this.client = env.STRIPE_SECRET_KEY
      ? new Stripe(env.STRIPE_SECRET_KEY, { apiVersion: "2026-02-25.clover" })
      : null;
    if (!this.client) {
      logger.warn("STRIPE_SECRET_KEY not set — Stripe integration is disabled");
    }
  }

  isConfigured(): boolean {
    return this.client !== null;
  }
}
