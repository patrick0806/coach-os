import { Injectable } from "@nestjs/common";

import { DrizzleProvider } from "@shared/providers/drizzle.service";
import { UsersRepository } from "@shared/repositories/users.repository";
import { PersonalsRepository } from "@shared/repositories/personals.repository";

import { UpdateProfileRequestDTO } from "./dtos/request.dto";
import { GetProfileResponseDTO } from "../get-profile/dtos/response.dto";

@Injectable()
export class UpdateProfileService {
  constructor(
    private readonly usersRepository: UsersRepository,
    private readonly personalsRepository: PersonalsRepository,
    private readonly drizzle: DrizzleProvider,
  ) {}

  async execute(
    profileId: string,
    userId: string,
    dto: UpdateProfileRequestDTO,
  ): Promise<GetProfileResponseDTO> {
    const { name, ...personalFields } = dto;
    const hasPersonalFields = Object.keys(personalFields).length > 0;

    const result = await this.drizzle.db.transaction(async (tx) => {
      const user = name
        ? await this.usersRepository.update(userId, { name }, tx)
        : await this.usersRepository.findById(userId, tx);

      const personal = hasPersonalFields
        ? await this.personalsRepository.update(profileId, personalFields, tx)
        : await this.personalsRepository.findById(profileId, tx);

      return { user, personal };
    });

    return {
      id: result.personal.id,
      userId: result.personal.userId,
      name: result.user.name,
      email: result.user.email,
      slug: result.personal.slug,
      bio: result.personal.bio,
      profilePhoto: result.personal.profilePhoto,
      themeColor: result.personal.themeColor,
      phoneNumber: result.personal.phoneNumber,
      lpTitle: result.personal.lpTitle,
      lpSubtitle: result.personal.lpSubtitle,
      lpHeroImage: result.personal.lpHeroImage,
      lpAboutTitle: result.personal.lpAboutTitle,
      lpAboutText: result.personal.lpAboutText,
      lpImage1: result.personal.lpImage1,
      lpImage2: result.personal.lpImage2,
      lpImage3: result.personal.lpImage3,
    };
  }
}
