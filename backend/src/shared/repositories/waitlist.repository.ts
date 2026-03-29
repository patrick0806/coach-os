import { Injectable } from "@nestjs/common";
import { eq } from "drizzle-orm";

import { DrizzleProvider } from "@shared/providers/drizzle.service";
import { waitlist } from "@config/database/schema/waitlist";

@Injectable()
export class WaitlistRepository {
  constructor(private readonly drizzle: DrizzleProvider) {}

  async findByEmail(email: string) {
    const result = await this.drizzle.db
      .select()
      .from(waitlist)
      .where(eq(waitlist.email, email))
      .limit(1);

    return result[0] ?? null;
  }

  async create(data: { email: string; name?: string }): Promise<void> {
    await this.drizzle.db.insert(waitlist).values(data);
  }
}
