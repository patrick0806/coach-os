"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Dumbbell } from "lucide-react";

import { authStore } from "@/stores/authStore";
import { LoadingState } from "@/shared/components/loadingState";
import { Sidebar, MobileSidebarTrigger } from "@/features/dashboard/components/sidebar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    // Check initial auth state
    if (!authStore.isAuthenticated()) {
      router.replace("/login");
      return;
    }
    setChecking(false);

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
    <div className="flex min-h-screen">
      <Sidebar />

      {/* Main content */}
      <div className="flex flex-1 flex-col">
        <header className="flex h-16 items-center gap-3 border-b border-border bg-background px-4 lg:px-8">
          <MobileSidebarTrigger />
          <div className="flex items-center gap-3 lg:hidden">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Dumbbell className="h-4 w-4" />
            </div>
            <span className="font-bold tracking-tight">Coach OS</span>
          </div>
        </header>

        <main className="flex-1 p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
