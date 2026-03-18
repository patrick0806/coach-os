// Static fixture data for coaching contracts E2E behavioral tests.
// These represent the exact shape returned by the backend API after
// the BuildResponseInterceptor unwraps the { data: ... } envelope.

export const MOCK_TENANT_ID_CONTRACTS = "mock-tenant-abc123"
// Must match activeStudents[0].id from students.fixtures.ts
export const MOCK_STUDENT_ID = "st-1"

export const activeContract = {
  id: "contract-active-1",
  tenantId: MOCK_TENANT_ID_CONTRACTS,
  studentId: MOCK_STUDENT_ID,
  servicePlanId: "plan-online-1",
  status: "active",
  startDate: "2026-01-01T00:00:00Z",
  endDate: null,
  createdAt: "2026-01-01T00:00:00Z",
  updatedAt: "2026-01-01T00:00:00Z",
  servicePlan: {
    id: "plan-online-1",
    name: "Consultoria Online",
    price: "299.90",
    attendanceType: "online",
    sessionsPerWeek: 3,
    durationMinutes: 60,
  },
}

export const cancelledContract = {
  id: "contract-cancelled-1",
  tenantId: MOCK_TENANT_ID_CONTRACTS,
  studentId: MOCK_STUDENT_ID,
  servicePlanId: "plan-presential-1",
  status: "cancelled",
  startDate: "2025-06-01T00:00:00Z",
  endDate: "2025-12-31T00:00:00Z",
  createdAt: "2025-06-01T00:00:00Z",
  updatedAt: "2025-12-31T00:00:00Z",
  servicePlan: {
    id: "plan-presential-1",
    name: "Personal Presencial",
    price: "499.90",
    attendanceType: "presential",
    sessionsPerWeek: 2,
    durationMinutes: 90,
  },
}

export const newActiveContract = {
  id: "contract-new-1",
  tenantId: MOCK_TENANT_ID_CONTRACTS,
  studentId: MOCK_STUDENT_ID,
  servicePlanId: "plan-presential-1",
  status: "active",
  startDate: "2026-03-18T00:00:00Z",
  endDate: null,
  createdAt: "2026-03-18T00:00:00Z",
  updatedAt: "2026-03-18T00:00:00Z",
  servicePlan: {
    id: "plan-presential-1",
    name: "Personal Presencial",
    price: "499.90",
    attendanceType: "presential",
    sessionsPerWeek: 2,
    durationMinutes: 90,
  },
}

export const coachingContractsFixtures = {
  // No contracts yet
  empty: [] as object[],

  // One active contract
  withActiveContract: [activeContract],

  // Active + one cancelled (history)
  withHistory: [activeContract, cancelledContract],

  // After cancel — only the cancelled contract remains
  afterCancel: [{ ...activeContract, status: "cancelled", endDate: "2026-03-18T00:00:00Z" }],

  // After plan change: new active + old as cancelled
  afterPlanChange: [newActiveContract, { ...activeContract, status: "cancelled", endDate: "2026-03-18T00:00:00Z" }],
}
