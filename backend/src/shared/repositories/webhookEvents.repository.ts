import { Injectable } from "@nestjs/common";
import { eq } from "drizzle-orm";

import { DrizzleProvider } from "@shared/providers/drizzle.service";
import { webhookEvents } from "@config/database/schema/webhookEvents";

@Injectable()
export class WebhookEventsRepository {
  constructor(private readonly drizzle: DrizzleProvider) {}

  async existsByEventId(eventId: string): Promise<boolean> {
    const result = await this.drizzle.db
      .select({ id: webhookEvents.id })
      .from(webhookEvents)
      .where(eq(webhookEvents.eventId, eventId))
      .limit(1);

    return result.length > 0;
  }

  async create(data: {
    eventId: string;
    eventType: string;
  }): Promise<void> {
    await this.drizzle.db
      .insert(webhookEvents)
      .values(data);
  }
}
