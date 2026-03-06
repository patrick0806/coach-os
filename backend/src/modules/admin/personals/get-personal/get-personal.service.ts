import { Injectable, NotFoundException } from "@nestjs/common";

import { AdminPersonalsRepository, PersonalWithUserDetail } from "@shared/repositories/admin-personals.repository";

@Injectable()
export class GetPersonalService {
  constructor(private readonly adminPersonalsRepository: AdminPersonalsRepository) {}

  async execute(id: string): Promise<PersonalWithUserDetail> {
    const personal = await this.adminPersonalsRepository.findByIdWithUser(id);
    if (!personal) {
      throw new NotFoundException("Personal não encontrado");
    }
    return personal;
  }
}
