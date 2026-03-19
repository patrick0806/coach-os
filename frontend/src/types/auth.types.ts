export interface AuthUserSubscription {
  accessStatus: 'active' | 'trialing' | 'past_due' | 'expired' | 'suspended' | null;
  subscriptionStatus: string | null;
  planId: string | null;
  planName: string | null;
  trialEndsAt: string | null;
  subscriptionExpiresAt: string | null;
}

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: string;
  tenantId: string;
  subscription?: AuthUserSubscription | null;
}

export interface AuthTokensResponse {
  accessToken: string;
  user: AuthUser;
  subscription?: AuthUserSubscription | null;
}

// Refresh endpoint only rotates the access token — user data is preserved from the existing session
export interface RefreshTokenResponse {
  accessToken: string;
}
