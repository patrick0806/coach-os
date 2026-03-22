import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";

import { AdminsRepository } from "@shared/repositories/admins.repository";
import { UsersRepository } from "@shared/repositories/users.repository";

@Injectable()
export class DeleteAdminUseCase {
  constructor(
    private readonly adminsRepository: AdminsRepository,
    private readonly usersRepository: UsersRepository,
  ) {}

  async execute(id: string, requestingAdminId: string): Promise<void> {
    if (id === requestingAdminId) {
      throw new BadRequestException("Cannot delete your own admin account");
    }

    const admin = await this.adminsRepository.findById(id);
    if (!admin) {
      throw new NotFoundException("Admin not found");
    }

    await this.adminsRepository.deleteById(id);

    // CHK-028: Also delete the user to prevent orphan with ADMIN role
    await this.usersRepository.deleteById(admin.userId);
  }
}
