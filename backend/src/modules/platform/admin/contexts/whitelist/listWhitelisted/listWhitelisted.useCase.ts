import { Injectable } from "@nestjs/common";
import { PersonalsRepository } from "@shared/repositories/personals.repository";

@Injectable()
export class ListWhitelistedUseCase {
  constructor(private readonly personalsRepository: PersonalsRepository) {}

  async execute() {
    const { rows } = await this.personalsRepository.findAllPaginated({ page: 0, size: 1000 });
    return rows.filter((p) => p.isWhitelisted).map((p) => ({
      id: p.id,
      name: p.name,
      email: p.email,
      slug: p.slug,
      accessStatus: p.accessStatus,
      isWhitelisted: p.isWhitelisted,
    }));
  }
}
