export const adminStatsFixture = {
  totalCoaches: 42,
  payingCoaches: 30,
  newThisMonth: 5,
  totalStudents: 310,
  whitelistedCoaches: 3,
};

export const adminPlansFixture = [
  {
    id: "plan-1",
    name: "Básico",
    description: "Plano básico",
    price: "29.90",
    maxStudents: 10,
    highlighted: false,
    order: 1,
    benefits: [],
    stripePriceId: null,
    isDefault: true,
    isActive: true,
    createdAt: "2025-01-01T00:00:00.000Z",
  },
  {
    id: "plan-2",
    name: "Pro",
    description: "Plano pro",
    price: "49.90",
    maxStudents: 30,
    highlighted: true,
    order: 2,
    benefits: [],
    stripePriceId: null,
    isDefault: false,
    isActive: true,
    createdAt: "2025-01-01T00:00:00.000Z",
  },
];

export const adminWhitelistFixture = [
  {
    id: "personal-1",
    name: "João Silva",
    email: "joao@example.com",
    slug: "joao-silva",
    accessStatus: "active",
    isWhitelisted: true,
  },
];

export const adminAdminsFixture = [
  {
    id: "admin-1",
    userId: "user-admin-1",
    name: "Super Admin",
    email: "admin@coachos.com",
    createdAt: "2025-01-01T00:00:00.000Z",
  },
];

export const adminTenantsFixture = {
  content: [
    {
      id: "personal-1",
      name: "João Silva",
      email: "joao@example.com",
      slug: "joao-silva",
      accessStatus: "active",
      subscriptionPlanId: "plan-1",
      isWhitelisted: false,
      onboardingCompleted: true,
      createdAt: "2025-01-15T00:00:00.000Z",
    },
    {
      id: "personal-2",
      name: "Maria Souza",
      email: "maria@example.com",
      slug: "maria-souza",
      accessStatus: "trialing",
      subscriptionPlanId: null,
      isWhitelisted: false,
      onboardingCompleted: false,
      createdAt: "2025-02-10T00:00:00.000Z",
    },
  ],
  page: 0,
  size: 20,
  totalElements: 2,
  totalPages: 1,
};

export const adminTenantDetailFixture = {
  id: "personal-1",
  name: "João Silva",
  email: "joao@example.com",
  slug: "joao-silva",
  accessStatus: "active",
  subscriptionPlanId: "plan-1",
  subscriptionStatus: "active",
  isWhitelisted: false,
  onboardingCompleted: true,
  stripeCustomerId: "cus_mock123",
  stripeSubscriptionId: "sub_mock123",
  subscriptionExpiresAt: null,
  trialEndsAt: null,
  createdAt: "2025-01-15T00:00:00.000Z",
};
