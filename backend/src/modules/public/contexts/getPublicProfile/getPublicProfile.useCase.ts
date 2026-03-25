import { Injectable, NotFoundException } from "@nestjs/common";

import { PersonalsRepository } from "@shared/repositories/personals.repository";
import { ServicePlansRepository, ServicePlan } from "@shared/repositories/servicePlans.repository";
import { WorkingHoursRepository, WorkingHours } from "@shared/repositories/workingHours.repository";
import { RecurringSlotsRepository, RecurringSlot } from "@shared/repositories/recurringSlots.repository";

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
  logoUrl: string | null;
  specialties: string[] | null;
  phoneNumber: string | null;
  themeColor: string | null;
  themeColorSecondary: string | null;
  lpLayout: string;
  lpTitle: string | null;
  lpSubtitle: string | null;
  lpHeroImage: string | null;
  lpAboutTitle: string | null;
  lpAboutText: string | null;
  lpImage1: string | null;
  lpImage2: string | null;
  lpImage3: string | null;
  servicePlans: ServicePlan[];
  workingHours: WorkingHours[];
  occupiedSlots: OccupiedSlot[];
}

@Injectable()
export class GetPublicProfileUseCase {
  constructor(
    private readonly personalsRepository: PersonalsRepository,
    private readonly servicePlansRepository: ServicePlansRepository,
    private readonly workingHoursRepository: WorkingHoursRepository,
    private readonly recurringSlotsRepository: RecurringSlotsRepository,
  ) { }

  async execute(slug: string): Promise<PublicProfileResult> {
    const personal = await this.personalsRepository.findBySlug(slug);

    if (!personal) {
      throw new NotFoundException("Coach not found");
    }

    const [servicePlans, workingHours, recurringSlots] = await Promise.all([
      this.servicePlansRepository.findActiveByTenantId(personal.id),
      this.workingHoursRepository.findActiveByTenant(personal.id),
      this.recurringSlotsRepository.findByTenantId(personal.id),
    ]);

    const occupiedSlots: OccupiedSlot[] = recurringSlots.map((s: RecurringSlot) => ({
      dayOfWeek: s.dayOfWeek,
      startTime: s.startTime,
      endTime: s.endTime,
    }));

    return {
      slug: personal.slug,
      coachName: personal.coachName,
      bio: personal.bio,
      profilePhoto: personal.profilePhoto,
      logoUrl: personal.logoUrl,
      specialties: personal.specialties,
      phoneNumber: personal.phoneNumber,
      themeColor: personal.themeColor,
      themeColorSecondary: personal.themeColorSecondary,
      lpLayout: personal.lpLayout ?? "1",
      lpTitle: personal.lpTitle,
      lpSubtitle: personal.lpSubtitle,
      lpHeroImage: personal.lpHeroImage,
      lpAboutTitle: personal.lpAboutTitle,
      lpAboutText: personal.lpAboutText,
      lpImage1: personal.lpImage1,
      lpImage2: personal.lpImage2,
      lpImage3: personal.lpImage3,
      servicePlans,
      workingHours,
      occupiedSlots,
    };
  }
}
