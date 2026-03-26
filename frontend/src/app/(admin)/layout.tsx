"use client";

import { startTransition, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

import { authStore } from "@/stores/authStore";
import { AdminSidebar, MobileAdminSidebarTrigger } from "@/features/admin/components/adminSidebar";
import { LoadingState } from "@/shared/components/loadingState";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const user = authStore.getUser();
    if (!authStore.isAuthenticated() || user?.role !== "ADMIN") {
      router.replace("/dashboard");
      return;
    }
    startTransition(() => setChecking(false));
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
      <AdminSidebar />

      <div className="flex flex-1 flex-col overflow-hidden">
        <header className="flex h-16 shrink-0 items-center gap-3 border-b border-border bg-background px-4 lg:px-8">
          <MobileAdminSidebarTrigger />
          <div className="flex items-center gap-3 lg:hidden">
            <Image src="/logo_transparent.png" alt="Coach OS" width={32} height={32} />
            <div>
              <span className="font-bold tracking-tight">Coach OS</span>
              <span className="ml-1 text-xs text-muted-foreground">Admin</span>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
