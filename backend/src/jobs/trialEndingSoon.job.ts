import { Injectable } from "@nestjs/common";
import { Cron, CronExpression } from "@nestjs/schedule";
import { addDays } from "date-fns";

import { env } from "@config/env";
import { PersonalsRepository } from "@shared/repositories/personals.repository";
import { ResendProvider } from "@shared/providers/resend.provider";
import { LogBuilderService } from "@shared/providers/LogBuilder.service";

@Injectable()
export class TrialEndingSoonJob {
  constructor(
    private readonly personalsRepository: PersonalsRepository,
    private readonly resendProvider: ResendProvider,
  ) {}

  // Runs every day at 9 AM UTC
  @Cron(CronExpression.EVERY_DAY_AT_9AM)
  async handle(): Promise<void> {
    const today = new Date();

    await this.notifyTrialsEndingInDays(today, 3);
    await this.notifyTrialsEndingInDays(today, 1);
  }

  private async notifyTrialsEndingInDays(from: Date, days: number): Promise<void> {
    const targetDate = addDays(from, days);
    const coaches = await this.personalsRepository.findTrialsEndingOn(targetDate);

    if (coaches.length === 0) return;

    LogBuilderService.log("info", `Sending trial-ending-soon emails: ${coaches.length} coach(es) with trial ending in ${days} day(s)`);

    for (const coach of coaches) {
      await this.resendProvider.sendTrialEndingSoon({
        to: coach.email,
        userName: coach.name,
        trialEndsAt: coach.trialEndsAt.toISOString(),
        upgradeUrl: `${env.APP_URL}/assinatura`,
      });
    }
  }
}
