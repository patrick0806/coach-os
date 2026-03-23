"use client";

import { startTransition, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { differenceInDays } from "date-fns";
import Image from "next/image";
import Link from "next/link";

import { authStore } from "@/stores/authStore";
import { getSessionRestorePromise } from "@/providers/appProvider";
import { LoadingState } from "@/shared/components/loadingState";
import { Sidebar, MobileSidebarTrigger } from "@/features/dashboard/components/sidebar";
import { OnboardingHeaderButton } from "@/features/onboarding/components/onboardingHeaderButton";

function TrialBanner() {
  const user = authStore.getUser();
  const sub = user?.subscription;

  if (!sub || sub.accessStatus !== "trialing" || !sub.trialEndsAt) return null;

  const daysLeft = differenceInDays(new Date(sub.trialEndsAt), new Date());
  if (daysLeft < 0) return null;

  const isUrgent = daysLeft <= 2;

  return (
    <div
      className={`flex items-center justify-between gap-2 px-4 py-2 text-sm ${
        isUrgent
          ? "bg-destructive text-destructive-foreground"
          : "bg-primary/10 text-primary"
      }`}
    >
      <span>
        {daysLeft === 0
          ? "Seu trial termina hoje!"
          : `Seu trial termina em ${daysLeft} dia${daysLeft === 1 ? "" : "s"}`}
      </span>
      <Link
        href="/assinatura"
        className={`rounded px-2 py-0.5 text-xs font-semibold underline-offset-2 hover:underline ${
          isUrgent ? "text-destructive-foreground" : "text-primary"
        }`}
      >
        Assinar agora
      </Link>
    </div>
  );
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    // Wait for session restore (refresh) to complete before checking auth.
    // Without this, the layout would redirect to /login before the refresh
    // call has a chance to restore the access token.
    const restorePromise = getSessionRestorePromise();
    const check = () => {
      if (!authStore.isAuthenticated()) {
        router.replace("/login");
        return;
      }
      startTransition(() => setChecking(false));
    };

    if (restorePromise) {
      restorePromise.then(check);
    } else {
      check();
    }

    // Subscribe to auth changes (e.g., token refresh failure → clear → redirect)
    const unsubscribe = authStore.subscribe((state) => {
      if (!state.accessToken) {
        router.replace("/login");
      }
    });

    return unsubscribe;
  }, [router]);

  if (checking) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <LoadingState variant="page" className="max-w-lg" />
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />

      {/* Main content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        <TrialBanner />
        <header className="flex h-16 shrink-0 items-center gap-3 border-b border-border bg-background px-4 lg:px-8">
          <MobileSidebarTrigger />
          <div className="flex items-center gap-3 lg:hidden">
            <Image src="/logo_transparent.png" alt="Coach OS" width={32} height={32} />
            <span className="font-bold tracking-tight">Coach OS</span>
          </div>
          <div className="ml-auto">
            <OnboardingHeaderButton />
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
