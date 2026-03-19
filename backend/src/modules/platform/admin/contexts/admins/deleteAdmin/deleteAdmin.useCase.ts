import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";

import { AdminsRepository } from "@shared/repositories/admins.repository";

@Injectable()
export class DeleteAdminUseCase {
  constructor(private readonly adminsRepository: AdminsRepository) {}

  async execute(id: string, requestingAdminId: string): Promise<void> {
    if (id === requestingAdminId) {
      throw new BadRequestException("Cannot delete your own admin account");
    }

    const admin = await this.adminsRepository.findById(id);
    if (!admin) {
      throw new NotFoundException("Admin not found");
    }

    await this.adminsRepository.deleteById(id);
  }
}
