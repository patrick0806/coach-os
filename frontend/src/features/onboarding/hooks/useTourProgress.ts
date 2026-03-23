import { useQuery, useQueryClient } from '@tanstack/react-query';
import { profileService } from '@/features/profileEditor/services/profile.service';
import { SHOW_TUTORIAL, TOUR_PAGES, type TourPage } from '@/features/onboarding/config';
import { authStore } from '@/stores/authStore';

const TOUR_PROGRESS_KEY = ['tour-progress'];

const LOCAL_STORAGE_KEY = 'coach_os_tour_progress';

function readFromLocalStorage(): TourPage[] {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    return raw ? (JSON.parse(raw) as TourPage[]) : [];
  } catch {
    return [];
  }
}

function writeToLocalStorage(pages: TourPage[]): void {
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(pages));
  } catch {
    // ignore quota errors
  }
}

export function useTourProgress() {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: TOUR_PROGRESS_KEY,
    queryFn: async () => {
      const pages = await profileService.getTourProgress();
      writeToLocalStorage(pages);
      // Sync auth store if all pages are completed but cookie is stale
      if (pages.length >= TOUR_PAGES.length && !authStore.getUser()?.onboardingCompleted) {
        authStore.setOnboardingCompleted();
      }
      return pages;
    },
    // placeholderData shows localStorage cache immediately without blocking the server fetch
    placeholderData: () => readFromLocalStorage(),
    enabled: SHOW_TUTORIAL,
  });

  function isPageCompleted(page: TourPage): boolean {
    return (query.data ?? []).includes(page);
  }

  function invalidate(): void {
    queryClient.invalidateQueries({ queryKey: TOUR_PROGRESS_KEY });
  }

  return {
    completedPages: query.data ?? [],
    isPageCompleted,
    isLoading: query.isLoading,
    invalidate,
  };
}
