"use client";

import { startTransition, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { authStore } from "@/stores/authStore";
import { AdminSidebar } from "@/features/admin/components/adminSidebar";
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
    <div className="flex min-h-screen">
      <AdminSidebar />
      <main className="flex-1 p-6 lg:p-8">{children}</main>
    </div>
  );
}
