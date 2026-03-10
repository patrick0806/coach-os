"use client";

import Link from "next/link";
import { useState } from "react";
import { usePathname } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { AlertTriangle, Menu } from "lucide-react";

import { PainelSidebar } from "@/components/shared/painel-sidebar";
import { getMySubscription } from "@/services/subscriptions.service";

interface PainelShellProps {
  children: React.ReactNode;
}

export function PainelShell({ children }: PainelShellProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();

  const { data: subscription } = useQuery({
    queryKey: ["subscription", "trial-warning"],
    queryFn: getMySubscription,
    retry: false,
  });

  const shouldHideWarning =
    pathname.startsWith("/painel/assinatura") || pathname.startsWith("/painel/bloqueado");

  const trialEndsAt = subscription?.trialEndsAt ? new Date(subscription.trialEndsAt) : null;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const msUntilTrialEnds = trialEndsAt ? trialEndsAt.getTime() - today.getTime() : null;
  const trialDaysRemaining =
    msUntilTrialEnds === null ? null : Math.ceil(msUntilTrialEnds / (1000 * 60 * 60 * 24));
  const shouldShowTrialWarning =
    !shouldHideWarning &&
    subscription?.status === "trialing" &&
    trialDaysRemaining !== null &&
    trialDaysRemaining >= 0 &&
    trialDaysRemaining <= 7;

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      {/* Sidebar — only on desktop */}
      <div className="hidden lg:flex lg:h-screen lg:shrink-0">
        <PainelSidebar />
      </div>

      {/* Mobile sidebar drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/40"
            onClick={() => setMobileOpen(false)}
            aria-hidden="true"
          />
          {/* Drawer panel */}
          <div className="relative z-50 flex h-full w-64 flex-col shadow-xl">
            <PainelSidebar onClose={() => setMobileOpen(false)} />
          </div>
        </div>
      )}

      {/* Content area */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Mobile top header */}
        <header className="flex h-14 shrink-0 items-center border-b bg-white px-4 lg:hidden">
          <button
            onClick={() => setMobileOpen(true)}
            className="rounded-md p-2 text-gray-600 hover:bg-gray-100"
            aria-label="Abrir menu"
          >
            <Menu className="size-5" />
          </button>
          <span className="ml-3 text-base font-bold tracking-tight text-gray-900">Coach OS</span>
        </header>

        <main className="flex-1 overflow-y-auto">
          {shouldShowTrialWarning ? (
            <div className="border-b border-amber-200 bg-amber-50 px-4 py-3 sm:px-8">
              <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-3">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="mt-0.5 size-4 shrink-0 text-amber-600" />
                  <p className="text-sm text-amber-900">
                    Seu trial termina em{" "}
                    <span className="font-semibold">
                      {trialDaysRemaining} {trialDaysRemaining === 1 ? "dia" : "dias"}
                    </span>
                    . Regularize sua assinatura para evitar bloqueio de acesso.
                  </p>
                </div>
                <Link
                  href="/painel/assinatura"
                  className="text-sm font-medium text-amber-900 underline underline-offset-4"
                >
                  Ver assinatura
                </Link>
              </div>
            </div>
          ) : null}
          {children}
        </main>
      </div>
    </div>
  );
}
