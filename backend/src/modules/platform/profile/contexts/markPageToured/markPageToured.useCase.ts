import { BadRequestException, Injectable } from "@nestjs/common";

import { PersonalsRepository } from "@shared/repositories/personals.repository";

export const VALID_TOUR_PAGES = [
  "exercises",
  "students",
  "training",
  "schedule",
  "availability",
  "services",
  "landingPage",
  "profile",
] as const;

export type TourPage = (typeof VALID_TOUR_PAGES)[number];

@Injectable()
export class MarkPageTouredUseCase {
  constructor(private readonly personalsRepository: PersonalsRepository) {}

  async execute(tenantId: string, page: string): Promise<string[]> {
    if (!VALID_TOUR_PAGES.includes(page as TourPage)) {
      throw new BadRequestException(`Invalid tour page: ${page}`);
    }

    return this.personalsRepository.markPageToured(tenantId, page);
  }
}
