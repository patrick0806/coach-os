'use client'

import { usePageTour } from '@/features/onboarding/hooks/usePageTour'
import type { TourPage } from '@/features/onboarding/config'

interface PageTourInitializerProps {
  page: TourPage
  startTour: () => void
}

/**
 * Invisible client component dropped into any page to auto-trigger
 * the onboarding tour on first visit. Re-run via the "Tutorial" header button.
 */
export function PageTourInitializer({ page, startTour }: PageTourInitializerProps) {
  usePageTour(page, { startTour })
  return null
}
