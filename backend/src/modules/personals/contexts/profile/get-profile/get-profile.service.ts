import { Injectable, NotFoundException } from "@nestjs/common";

import { UsersRepository } from "@shared/repositories/users.repository";
import { PersonalsRepository } from "@shared/repositories/personals.repository";

import { GetProfileResponseDTO } from "./dtos/response.dto";

@Injectable()
export class GetProfileService {
  constructor(
    private readonly usersRepository: UsersRepository,
    private readonly personalsRepository: PersonalsRepository,
  ) {}

  async execute(userId: string): Promise<GetProfileResponseDTO> {
    const [user, personal] = await Promise.all([
      this.usersRepository.findById(userId),
      this.personalsRepository.findByUserId(userId),
    ]);

    if (!personal) {
      throw new NotFoundException("Perfil não encontrado");
    }

    return {
      id: personal.id,
      userId: personal.userId,
      name: user.name,
      email: user.email,
      slug: personal.slug,
      bio: personal.bio,
      profilePhoto: personal.profilePhoto,
      themeColor: personal.themeColor,
      phoneNumber: personal.phoneNumber,
      lpTitle: personal.lpTitle,
      lpSubtitle: personal.lpSubtitle,
      lpHeroImage: personal.lpHeroImage,
      lpAboutTitle: personal.lpAboutTitle,
      lpAboutText: personal.lpAboutText,
      lpImage1: personal.lpImage1,
      lpImage2: personal.lpImage2,
      lpImage3: personal.lpImage3,
    };
  }
}
