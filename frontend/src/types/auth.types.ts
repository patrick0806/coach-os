export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: string;
  tenantId: string;
}

export interface AuthTokensResponse {
  accessToken: string;
  user: AuthUser;
}

// Refresh endpoint only rotates the access token — user data is preserved from the existing session
export interface RefreshTokenResponse {
  accessToken: string;
}
