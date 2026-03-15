import { Injectable } from "@nestjs/common";
import { eq } from "drizzle-orm";

import { DrizzleProvider } from "@shared/providers/drizzle.service";
import { personals, Personal } from "@config/database/schema/personals";

@Injectable()
export class PersonalsRepository {
  constructor(private readonly drizzle: DrizzleProvider) {}

  async findById(id: string): Promise<Personal | undefined> {
    const result = await this.drizzle.db
      .select()
      .from(personals)
      .where(eq(personals.id, id))
      .limit(1);

    return result[0];
  }

  async updateSubscription(
    id: string,
    data: Partial<
      Pick<
        Personal,
        | "accessStatus"
        | "subscriptionStatus"
        | "subscriptionExpiresAt"
        | "stripeSubscriptionId"
        | "stripeCustomerId"
        | "subscriptionPlanId"
      >
    >,
  ): Promise<void> {
    await this.drizzle.db
      .update(personals)
      .set(data)
      .where(eq(personals.id, id));
  }
}
