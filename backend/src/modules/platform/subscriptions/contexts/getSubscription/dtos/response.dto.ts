export interface GetSubscriptionPlanDTO {
  id: string;
  name: string;
  price: string;
  maxStudents: number;
  highlighted: boolean;
}

export interface GetSubscriptionResponseDTO {
  plan: GetSubscriptionPlanDTO | null;
  accessStatus: string;
  subscriptionStatus: string | null;
  trialEndsAt: string | null;
  subscriptionExpiresAt: string | null;
  studentsCount: number;
  studentsLimit: number;
}
