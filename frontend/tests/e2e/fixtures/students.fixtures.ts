// Static fixture data for students E2E behavioral tests.
export const MOCK_TENANT_ID = "mock-tenant-abc123"

export const activeStudents = [
  {
    id: "st-1",
    name: "Fernanda Costa",
    email: "fernanda@test.com",
    status: "active",
    phoneNumber: null,
    goal: null,
    observations: null,
    physicalRestrictions: null,
    createdAt: "2024-01-10T00:00:00Z",
  },
  {
    id: "st-2",
    name: "Carlos Mendonça",
    email: "carlos@test.com",
    status: "active",
    phoneNumber: null,
    goal: null,
    observations: null,
    physicalRestrictions: null,
    createdAt: "2024-01-11T00:00:00Z",
  },
  {
    id: "st-3",
    name: "Ana Paula Silva",
    email: "ana@test.com",
    status: "active",
    phoneNumber: null,
    goal: null,
    observations: null,
    physicalRestrictions: null,
    createdAt: "2024-01-12T00:00:00Z",
  },
]

function paginated(content: object[], page = 0, size = 20) {
  return {
    content,
    page,
    size,
    totalElements: content.length,
    totalPages: Math.max(1, Math.ceil(content.length / size)),
  }
}

export const studentsFixtures = {
  // Three active students (matches demo seed data structure)
  active: paginated(activeStudents),

  // Filtered: only "Fernanda"
  fernandaSearch: paginated([activeStudents[0]]),

  // Archived tab: empty
  archived: paginated([]),

  // Empty list
  empty: paginated([]),

  // After creating a new student
  afterCreate: (newStudent: object) => paginated([...activeStudents, newStudent]),
}

export const newStudentFixture = {
  id: "st-new",
  name: "Novo Aluno Teste",
  email: "novo@test.com",
  status: "active",
  phoneNumber: null,
  goal: null,
  observations: null,
  physicalRestrictions: null,
  createdAt: new Date().toISOString(),
}
