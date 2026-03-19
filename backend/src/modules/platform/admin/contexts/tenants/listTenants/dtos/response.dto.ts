export interface TenantListItemDTO {
  id: string;
  name: string;
  email: string;
  slug: string;
  accessStatus: string;
  subscriptionPlanId: string | null;
  isWhitelisted: boolean;
  onboardingCompleted: boolean;
  createdAt: Date | null;
}

export interface ListTenantsResponseDTO {
  content: TenantListItemDTO[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
}
