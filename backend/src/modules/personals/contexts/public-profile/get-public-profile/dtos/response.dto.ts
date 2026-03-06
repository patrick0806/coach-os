export class ServicePlanDTO {
  id: string;
  name: string;
  description: string | null;
  sessionsPerWeek: number;
  durationMinutes: number;
  price: string;
}

export class GetPublicProfileResponseDTO {
  id: string;
  name: string;
  slug: string;
  bio: string | null;
  profilePhoto: string | null;
  themeColor: string;
  phoneNumber: string | null;
  lpTitle: string | null;
  lpSubtitle: string | null;
  lpHeroImage: string | null;
  lpAboutTitle: string | null;
  lpAboutText: string | null;
  lpImage1: string | null;
  lpImage2: string | null;
  lpImage3: string | null;
  servicePlans: ServicePlanDTO[];
}
