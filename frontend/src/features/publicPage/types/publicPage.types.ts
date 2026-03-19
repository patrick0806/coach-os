export interface PublicAvailabilityRule {
  id: string
  dayOfWeek: number
  startTime: string
  endTime: string
  isActive: boolean
}

export interface PublicServicePlan {
  id: string
  name: string
  description: string | null
  price: string
  sessionsPerWeek: number | null
  durationMinutes: number | null
  attendanceType: "online" | "presential"
}

export interface OccupiedSlot {
  dayOfWeek: number
  startTime: string
  endTime: string
}

export interface PublicProfile {
  slug: string
  coachName: string
  bio: string | null
  profilePhoto: string | null
  logoUrl: string | null
  specialties: string[] | null
  phoneNumber: string | null
  themeColor: string | null
  lpTitle: string | null
  lpSubtitle: string | null
  lpHeroImage: string | null
  lpAboutTitle: string | null
  lpAboutText: string | null
  lpImage1: string | null
  lpImage2: string | null
  lpImage3: string | null
  servicePlans: PublicServicePlan[]
  availabilityRules: PublicAvailabilityRule[]
  occupiedSlots: OccupiedSlot[]
}
