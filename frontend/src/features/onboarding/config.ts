export const SHOW_TUTORIAL = process.env.NEXT_PUBLIC_SHOW_TUTORIAL === 'true';

export const TOUR_PAGES = [
  'exercises',
  'students',
  'training',
  'schedule',
  'availability',
  'services',
  'landingPage',
  'profile',
] as const;

export type TourPage = (typeof TOUR_PAGES)[number];
