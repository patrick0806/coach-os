export interface TenantDetailDTO {
  id: string;
  name: string;
  email: string;
  slug: string;
  accessStatus: string;
  subscriptionPlanId: string | null;
  subscriptionStatus: string | null;
  isWhitelisted: boolean;
  onboardingCompleted: boolean;
  stripeCustomerId: string | null;
  stripeSubscriptionId: string | null;
  subscriptionExpiresAt: string | null;
  trialEndsAt: string | null;
  createdAt: Date | null;
}
