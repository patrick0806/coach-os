import { useCallback, useEffect, useRef } from 'react';
import { useMutation } from '@tanstack/react-query';
import { profileService } from '@/features/profileEditor/services/profile.service';
import { SHOW_TUTORIAL, type TourPage } from '@/features/onboarding/config';
import { authStore } from '@/stores/authStore';
import { useTourProgress } from './useTourProgress';

const LOCAL_TOURED_KEY = 'coach_os_toured_pages';

function hasBeenToured(page: TourPage): boolean {
  try {
    const raw = localStorage.getItem(LOCAL_TOURED_KEY);
    const pages: TourPage[] = raw ? JSON.parse(raw) : [];
    return pages.includes(page);
  } catch {
    return false;
  }
}

function markToured(page: TourPage): void {
  try {
    const raw = localStorage.getItem(LOCAL_TOURED_KEY);
    const pages: TourPage[] = raw ? JSON.parse(raw) : [];
    if (!pages.includes(page)) {
      pages.push(page);
      localStorage.setItem(LOCAL_TOURED_KEY, JSON.stringify(pages));
    }
  } catch {
    // ignore
  }
}

interface UsePageTourOptions {
  /** Tour steps for this page — provide when using driver.js */
  startTour?: () => void;
  /** If true, re-runs the tour even if already completed */
  forceRun?: boolean;
}

export function usePageTour(page: TourPage, options: UsePageTourOptions = {}) {
  const { isPageCompleted, invalidate } = useTourProgress();
  const ranRef = useRef(false);

  const mutation = useMutation({
    mutationFn: () => profileService.markPageToured(page),
    onSuccess: (completedPages) => {
      invalidate();
      // If all 8 pages done, backend sets onboardingCompleted — update local store
      if (completedPages.length >= 8) {
        authStore.setOnboardingCompleted();
      }
    },
  });

  const runTour = useCallback(() => {
    if (!SHOW_TUTORIAL) return;
    options.startTour?.();
    markToured(page);
    mutation.mutate();
  }, [page, options, mutation]);

  // Auto-run on mount if not yet completed (server state) and not yet toured this session (local cache)
  useEffect(() => {
    if (!SHOW_TUTORIAL) return;
    if (ranRef.current) return;
    if (options.forceRun) {
      ranRef.current = true;
      runTour();
      return;
    }
    if (!isPageCompleted(page) && !hasBeenToured(page)) {
      ranRef.current = true;
      runTour();
    }
  }, [page, isPageCompleted, options.forceRun, runTour]);

  return {
    /** Manually trigger tour (e.g., from "Tutorial" header button) */
    runTour,
    isMarking: mutation.isPending,
  };
}
