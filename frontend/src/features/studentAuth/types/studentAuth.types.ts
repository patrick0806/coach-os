export interface StudentUser {
  id: string
  name: string
  email: string
  role: string
  tenantId: string
  personalSlug: string
}

export interface StudentLoginRequest {
  email: string
  password: string
}

export interface StudentLoginResponse {
  accessToken: string
  user: StudentUser
}
