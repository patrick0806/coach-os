// Static fixture data for training templates E2E behavioral tests.
export const MOCK_TENANT_ID = "mock-tenant-abc123"

export const templateItems = [
  {
    id: "tpl-1",
    name: "Programa Hipertrofia",
    description: "Programa focado em ganho de massa muscular",
    status: "active",
    workoutCount: 3,
    createdAt: "2024-01-15T00:00:00Z",
  },
  {
    id: "tpl-2",
    name: "Programa Emagrecimento",
    description: "Programa para perda de peso",
    status: "active",
    workoutCount: 5,
    createdAt: "2024-02-01T00:00:00Z",
  },
]

// Full template detail used for builder page
export const templateDetail = {
  id: "tpl-1",
  name: "Programa Hipertrofia",
  description: "Programa focado em ganho de massa muscular",
  status: "active",
  workouts: [
    {
      id: "wt-1",
      name: "Treino A - Peito",
      order: 1,
      exercises: [],
    },
  ],
  createdAt: "2024-01-15T00:00:00Z",
}

function paginated(content: object[], page = 0, size = 12) {
  return {
    content,
    page,
    size,
    totalElements: content.length,
    totalPages: Math.max(1, Math.ceil(content.length / size)),
  }
}

export const trainingTemplatesFixtures = {
  // Two templates
  withTemplates: paginated(templateItems),

  // Empty list
  empty: paginated([]),

  // No results for search
  noResults: paginated([]),

  // After creating a new template
  afterCreate: (newTemplate: object) => paginated([...templateItems, newTemplate]),

  // After deleting a template
  afterDelete: paginated([templateItems[1]]),
}

export const newTemplateFixture = {
  id: "tpl-new",
  name: "Novo Programa Teste",
  description: "Descrição de teste",
  status: "active",
  workoutCount: 0,
  createdAt: new Date().toISOString(),
}
