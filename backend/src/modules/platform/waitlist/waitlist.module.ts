import { Module } from "@nestjs/common";

import { WaitlistRepository } from "@shared/repositories/waitlist.repository";
import { ResendProvider } from "@shared/providers/resend.provider";

import { JoinWaitlistController } from "./contexts/joinWaitlist/joinWaitlist.controller";
import { JoinWaitlistUseCase } from "./contexts/joinWaitlist/joinWaitlist.useCase";

@Module({
  controllers: [JoinWaitlistController],
  providers: [JoinWaitlistUseCase, WaitlistRepository, ResendProvider],
})
export class WaitlistModule {}
