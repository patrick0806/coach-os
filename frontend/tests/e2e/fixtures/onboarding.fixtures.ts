import { MOCK_TENANT_ID } from './exercises.fixtures'
import type { TourPage } from '../../../src/features/onboarding/config'

export const MOCK_USER_NEW = {
  id: 'mock-user-id',
  name: 'Coach Test',
  email: 'test@coach.com',
  role: 'PERSONAL',
  tenantId: MOCK_TENANT_ID,
  onboardingCompleted: false,
}

export const MOCK_USER_ONBOARDED = {
  ...MOCK_USER_NEW,
  onboardingCompleted: true,
}

export const MOCK_ADMIN_USER = {
  id: 'mock-admin-id',
  name: 'Admin Test',
  email: 'admin@coachos.com',
  role: 'ADMIN',
  tenantId: MOCK_TENANT_ID,
  onboardingCompleted: false,
}

export const MOCK_NO_COMPLETED_PAGES: TourPage[] = []

export const MOCK_PARTIAL_COMPLETED_PAGES: TourPage[] = ['exercises', 'students', 'training']

export const MOCK_ALL_COMPLETED_PAGES: TourPage[] = [
  'exercises',
  'students',
  'training',
  'schedule',
  'availability',
  'services',
  'landingPage',
  'profile',
]
