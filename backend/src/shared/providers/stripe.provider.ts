import { Injectable, Logger } from "@nestjs/common";
import Stripe from "stripe";

import { env } from "@config/env";

@Injectable()
export class StripeProvider {
  readonly client: Stripe | null;
  private readonly logger = new Logger(StripeProvider.name);

  constructor() {
    this.client = env.STRIPE_SECRET_KEY
      ? new Stripe(env.STRIPE_SECRET_KEY, { apiVersion: "2026-02-25.clover" })
      : null;
    if (!this.client) {
      this.logger.warn("STRIPE_SECRET_KEY not set — Stripe integration is disabled");
    }
  }

  isConfigured(): boolean {
    return this.client !== null;
  }
}
