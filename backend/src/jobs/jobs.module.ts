import { Module } from "@nestjs/common";

import { PersonalsRepository } from "@shared/repositories/personals.repository";
import { ResendProvider } from "@shared/providers/resend.provider";

import { TrialEndingSoonJob } from "./trialEndingSoon.job";

@Module({
  providers: [
    TrialEndingSoonJob,
    PersonalsRepository,
    ResendProvider,
  ],
})
export class JobsModule {}
