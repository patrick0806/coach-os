import { Injectable } from "@nestjs/common";
import { AdminsRepository } from "@shared/repositories/admins.repository";

@Injectable()
export class ListAdminsUseCase {
  constructor(private readonly adminsRepository: AdminsRepository) {}

  async execute() {
    const admins = await this.adminsRepository.findAll();
    return admins.map((a) => ({
      id: a.id,
      userId: a.userId,
      name: a.name,
      email: a.email,
      createdAt: a.createdAt,
    }));
  }
}
