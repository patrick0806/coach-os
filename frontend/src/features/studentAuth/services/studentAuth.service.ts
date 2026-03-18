import { api } from "@/lib/axios"
import { studentAuthStore } from "@/stores/studentAuthStore"
import type { StudentLoginRequest, StudentLoginResponse } from "@/features/studentAuth/types/studentAuth.types"

export const studentAuthService = {
  login: async (data: StudentLoginRequest): Promise<StudentLoginResponse> => {
    // POST to the shared /auth/login endpoint — it handles STUDENT role
    const response = await api.post<StudentLoginResponse>("/auth/login", data)
    const { accessToken, user } = response.data

    // Store in the student-specific auth store
    studentAuthStore.setAuth(accessToken, user)

    return response.data
  },

  logout: (): void => {
    studentAuthStore.clear()
  },
}
