import { Injectable, NotFoundException } from "@nestjs/common";

import { PersonalsRepository } from "@shared/repositories/personals.repository";
import { UsersRepository } from "@shared/repositories/users.repository";

@Injectable()
export class TogglePersonalStatusService {
  constructor(
    private readonly personalsRepository: PersonalsRepository,
    private readonly usersRepository: UsersRepository,
  ) {}

  async execute(personalId: string, isActive: boolean): Promise<void> {
    const personal = await this.personalsRepository.findById(personalId);
    if (!personal) {
      throw new NotFoundException("Personal não encontrado");
    }

    await this.usersRepository.update(personal.userId, { isActive });
  }
}
