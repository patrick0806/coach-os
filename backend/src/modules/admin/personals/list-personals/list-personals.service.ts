import { Injectable } from "@nestjs/common";

import { AdminPersonalsRepository, PaginatedPersonals } from "@shared/repositories/admin-personals.repository";

export interface ListPersonalsOptions {
  page: number;
  size: number;
  search?: string;
}

@Injectable()
export class ListPersonalsService {
  constructor(private readonly adminPersonalsRepository: AdminPersonalsRepository) {}

  execute(options: ListPersonalsOptions): Promise<PaginatedPersonals> {
    return this.adminPersonalsRepository.findAllWithUser({
      page: options.page,
      size: options.size,
      search: options.search,
    });
  }
}
