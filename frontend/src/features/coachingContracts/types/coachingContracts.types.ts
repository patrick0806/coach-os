export type ContractStatus = "active" | "cancelled" | "expired"

export interface ContractServicePlan {
  id: string
  name: string
  price: string
  attendanceType: "online" | "presential"
  sessionsPerWeek: number | null
  durationMinutes: number | null
}

export interface CoachingContractItem {
  id: string
  tenantId: string
  studentId: string
  servicePlanId: string
  status: ContractStatus
  startDate: string
  endDate: string | null
  createdAt: string
  updatedAt: string
  servicePlan: ContractServicePlan
}

export interface CreateContractRequest {
  servicePlanId: string
}
