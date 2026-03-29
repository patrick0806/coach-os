import { Injectable } from "@nestjs/common";

import { WaitlistRepository } from "@shared/repositories/waitlist.repository";
import { ResendProvider } from "@shared/providers/resend.provider";

import { joinWaitlistSchema } from "./dtos/request.dto";

@Injectable()
export class JoinWaitlistUseCase {
  constructor(
    private readonly waitlistRepository: WaitlistRepository,
    private readonly resendProvider: ResendProvider,
  ) {}

  async execute(body: unknown): Promise<{ message: string }> {
    const { email, name } = joinWaitlistSchema.parse(body);

    const existing = await this.waitlistRepository.findByEmail(email);
    if (existing) {
      return { message: "Obrigado! Você será notificado quando estivermos prontos." };
    }

    await this.waitlistRepository.create({ email, name });

    this.resendProvider.sendWaitlistConfirmation({ to: email, name }).catch(() => {});

    return { message: "Obrigado! Você será notificado quando estivermos prontos." };
  }
}
