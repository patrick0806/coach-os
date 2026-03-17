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
