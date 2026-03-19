export interface AdminStats {
  totalCoaches: number;
  payingCoaches: number;
  newThisMonth: number;
  totalStudents: number;
  whitelistedCoaches: number;
}

export interface AdminPlan {
  id: string;
  name: string;
  description: string | null;
  price: string;
  maxStudents: number;
  highlighted: boolean | null;
  order: number | null;
  benefits: string[] | null;
  stripePriceId: string | null;
  isDefault: boolean | null;
  isActive: boolean | null;
  createdAt: string | null;
}

export interface AdminTenant {
  id: string;
  name: string;
  email: string;
  slug: string;
  accessStatus: string;
  subscriptionPlanId: string | null;
  isWhitelisted: boolean;
  onboardingCompleted: boolean;
  createdAt: string | null;
}

export interface AdminTenantDetail extends AdminTenant {
  subscriptionStatus: string | null;
  stripeCustomerId: string | null;
  stripeSubscriptionId: string | null;
  subscriptionExpiresAt: string | null;
  trialEndsAt: string | null;
}

export interface AdminAdmin {
  id: string;
  userId: string;
  name: string;
  email: string;
  createdAt: string | null;
}

export interface WhitelistedCoach {
  id: string;
  name: string;
  email: string;
  slug: string;
  accessStatus: string;
  isWhitelisted: boolean;
}

export interface ListTenantsResponse {
  content: AdminTenant[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
}
