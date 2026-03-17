// Static fixture data for exercises E2E behavioral tests.
// These represent the exact shape that the backend API returns after
// the BuildResponseInterceptor unwraps the { data: ... } envelope.

export const MOCK_TENANT_ID = "mock-tenant-abc123"

export const globalExercises = [
  {
    id: "ex-global-1",
    name: "Supino Reto",
    muscleGroup: "peitoral",
    description: "Exercício clássico para peitoral",
    instructions: null,
    mediaUrl: null,
    youtubeUrl: null,
    tenantId: null, // null = global = "Plataforma" badge
    createdAt: "2024-01-01T00:00:00Z",
  },
  {
    id: "ex-global-2",
    name: "Agachamento",
    muscleGroup: "pernas",
    description: "Exercício completo para pernas",
    instructions: null,
    mediaUrl: null,
    youtubeUrl: null,
    tenantId: null,
    createdAt: "2024-01-01T00:00:00Z",
  },
  {
    id: "ex-global-3",
    name: "Levantamento Terra",
    muscleGroup: "costas",
    description: "Exercício compound para costas",
    instructions: null,
    mediaUrl: null,
    youtubeUrl: null,
    tenantId: null,
    createdAt: "2024-01-01T00:00:00Z",
  },
]

export const privateExercise = {
  id: "ex-private-1",
  name: "Rosca Direta Custom",
  muscleGroup: "bíceps",
  description: "Exercício personalizado",
  instructions: null,
  mediaUrl: null,
  youtubeUrl: null,
  tenantId: MOCK_TENANT_ID, // non-null = private = "Meu" badge
  createdAt: "2024-06-01T00:00:00Z",
}

// Helper to build a paginated response
function paginated(content: object[], page = 0, size = 9) {
  return {
    content,
    page,
    size,
    totalElements: content.length,
    totalPages: Math.max(1, Math.ceil(content.length / size)),
  }
}

export const exercisesFixtures = {
  // Empty list — triggers empty state UI
  empty: paginated([]),

  // Only global exercises — no private, no pagination
  globalsOnly: paginated(globalExercises),

  // Global + one private exercise
  withPrivate: paginated([...globalExercises, privateExercise]),

  // Single private exercise used for edit/delete tests
  privateOnly: paginated([privateExercise]),

  // Pagination active: totalPages > 1
  withPagination: {
    content: globalExercises.slice(0, 2),
    page: 0,
    size: 2,
    totalElements: 10,
    totalPages: 5,
  },

  // Search for "Supino" returns one result
  supinoSearch: paginated([globalExercises[0]]),

  // Search with no matches
  noResults: paginated([]),

  // List after a private exercise was created (used in stateful mock)
  afterCreate: (newExercise: object) => paginated([...globalExercises, newExercise]),

  // List after a private exercise was deleted (only globals remain)
  afterDelete: paginated(globalExercises),
}
