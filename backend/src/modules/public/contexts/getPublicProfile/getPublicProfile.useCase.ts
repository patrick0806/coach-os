import { Injectable, NotFoundException } from "@nestjs/common";

import { PersonalsRepository } from "@shared/repositories/personals.repository";
import { ServicePlansRepository, ServicePlan } from "@shared/repositories/servicePlans.repository";
import { AvailabilityRulesRepository, AvailabilityRule } from "@shared/repositories/availabilityRules.repository";
import { TrainingSchedulesRepository, TrainingSchedule } from "@shared/repositories/trainingSchedules.repository";

export interface OccupiedSlot {
  dayOfWeek: number;
  startTime: string;
  endTime: string;
}

export interface PublicProfileResult {
  slug: string;
  coachName: string;
  bio: string | null;
  profilePhoto: string | null;
  specialties: string[] | null;
  phoneNumber: string | null;
  themeColor: string | null;
  lpTitle: string | null;
  lpSubtitle: string | null;
  lpHeroImage: string | null;
  lpAboutTitle: string | null;
  lpAboutText: string | null;
  lpImage1: string | null;
  lpImage2: string | null;
  lpImage3: string | null;
  servicePlans: ServicePlan[];
  availabilityRules: AvailabilityRule[];
  occupiedSlots: OccupiedSlot[];
}

@Injectable()
export class GetPublicProfileUseCase {
  constructor(
    private readonly personalsRepository: PersonalsRepository,
    private readonly servicePlansRepository: ServicePlansRepository,
    private readonly availabilityRulesRepository: AvailabilityRulesRepository,
    private readonly trainingSchedulesRepository: TrainingSchedulesRepository,
  ) { }

  async execute(slug: string): Promise<PublicProfileResult> {
    const personal = await this.personalsRepository.findBySlug(slug);

    if (!personal) {
      throw new NotFoundException("Coach not found");
    }

    const [servicePlans, availabilityRules, trainingSchedules] = await Promise.all([
      this.servicePlansRepository.findActiveByTenantId(personal.id),
      this.availabilityRulesRepository.findByTenantId(personal.id),
      this.trainingSchedulesRepository.findByTenantId(personal.id),
    ]);

    const occupiedSlots: OccupiedSlot[] = trainingSchedules.map((s: TrainingSchedule) => ({
      dayOfWeek: s.dayOfWeek,
      startTime: s.startTime,
      endTime: s.endTime,
    }));

    return {
      slug: personal.slug,
      coachName: personal.coachName,
      bio: personal.bio,
      profilePhoto: personal.profilePhoto,
      specialties: personal.specialties,
      phoneNumber: personal.phoneNumber,
      themeColor: personal.themeColor,
      lpTitle: personal.lpTitle,
      lpSubtitle: personal.lpSubtitle,
      lpHeroImage: personal.lpHeroImage,
      lpAboutTitle: personal.lpAboutTitle,
      lpAboutText: personal.lpAboutText,
      lpImage1: personal.lpImage1,
      lpImage2: personal.lpImage2,
      lpImage3: personal.lpImage3,
      servicePlans,
      availabilityRules,
      occupiedSlots,
    };
  }
}
