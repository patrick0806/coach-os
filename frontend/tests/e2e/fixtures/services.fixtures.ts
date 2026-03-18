// Static fixture data for service plans E2E behavioral tests.
// These represent the exact shape returned by the backend API after
// the BuildResponseInterceptor unwraps the { data: ... } envelope.

export const MOCK_TENANT_ID_SERVICES = "mock-tenant-abc123"

export const onlinePlan = {
  id: "plan-online-1",
  tenantId: MOCK_TENANT_ID_SERVICES,
  name: "Consultoria Online",
  description: "Acompanhamento completo online",
  price: "299.90",
  sessionsPerWeek: 3,
  durationMinutes: 60,
  attendanceType: "online",
  isActive: true,
  createdAt: "2024-01-01T00:00:00Z",
  updatedAt: "2024-01-01T00:00:00Z",
}

export const presentialPlan = {
  id: "plan-presential-1",
  tenantId: MOCK_TENANT_ID_SERVICES,
  name: "Personal Presencial",
  description: null,
  price: "499.90",
  sessionsPerWeek: 2,
  durationMinutes: 90,
  attendanceType: "presential",
  isActive: true,
  createdAt: "2024-02-01T00:00:00Z",
  updatedAt: "2024-02-01T00:00:00Z",
}

export const inactivePlan = {
  id: "plan-inactive-1",
  tenantId: MOCK_TENANT_ID_SERVICES,
  name: "Plano Inativo",
  description: null,
  price: "99.90",
  sessionsPerWeek: null,
  durationMinutes: null,
  attendanceType: "online",
  isActive: false,
  createdAt: "2024-03-01T00:00:00Z",
  updatedAt: "2024-03-01T00:00:00Z",
}

export const servicePlansFixtures = {
  // Empty list — triggers empty state UI
  empty: [] as object[],

  // Two active plans (online + presential)
  withPlans: [onlinePlan, presentialPlan],

  // All plans including inactive
  withInactive: [onlinePlan, presentialPlan, inactivePlan],

  // List after a plan was created (adds new plan)
  afterCreate: (newPlan: object) => [onlinePlan, presentialPlan, newPlan],

  // List after a plan was deleted (only online remains)
  afterDelete: [onlinePlan],
}
