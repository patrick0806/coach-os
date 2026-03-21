import type { TourPage } from '@/features/onboarding/config'
import { startExercisesTour } from './exercises.tour'
import { startStudentsTour } from './students.tour'
import { startTrainingTour } from './training.tour'
import { startScheduleTour } from './schedule.tour'
import { startAvailabilityTour } from './availability.tour'
import { startServicesTour } from './services.tour'
import { startLandingPageTour } from './landingPage.tour'
import { startProfileTour } from './profile.tour'

interface TourRoute {
  page: TourPage
  startTour: () => void
}

const ROUTE_TOUR_MAP: Record<string, TourRoute> = {
  '/exercises': { page: 'exercises', startTour: startExercisesTour },
  '/students': { page: 'students', startTour: startStudentsTour },
  '/training-templates': { page: 'training', startTour: startTrainingTour },
  '/agenda': { page: 'schedule', startTour: startScheduleTour },
  '/disponibilidade': { page: 'availability', startTour: startAvailabilityTour },
  '/services': { page: 'services', startTour: startServicesTour },
  '/pagina-publica': { page: 'landingPage', startTour: startLandingPageTour },
  '/settings': { page: 'profile', startTour: startProfileTour },
}

export function getTourForPathname(pathname: string): TourRoute | null {
  // Match exact or prefix (e.g. /students/123 → students tour)
  for (const [route, tour] of Object.entries(ROUTE_TOUR_MAP)) {
    if (pathname === route || pathname.startsWith(`${route}/`)) {
      return tour
    }
  }
  return null
}
