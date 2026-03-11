"use client";

import Link from "next/link";
import { useEffect, useState, useSyncExternalStore } from "react";
import { usePathname } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { AlertTriangle, Menu, Moon, Sun } from "lucide-react";

import { PainelQuickActionsFab } from "@/components/shared/painel-quick-actions-fab";
import { PainelSidebar } from "@/components/shared/painel-sidebar";
import { Button } from "@/components/ui/button";
import { getMySubscription } from "@/services/subscriptions.service";

interface PainelShellProps {
  children: React.ReactNode;
}

export function PainelShell({ children }: PainelShellProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [theme, setTheme] = useState<"light" | "dark">(() => {
    if (typeof window === "undefined") {
      return "light";
    }

    const storedTheme = window.localStorage.getItem("personal-theme");
    return storedTheme === "dark" || storedTheme === "light" ? storedTheme : "light";
  });
  const pathname = usePathname();
  const isClient = useSyncExternalStore(
    () => () => undefined,
    () => true,
    () => false,
  );

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

  useEffect(() => {
    window.localStorage.setItem("personal-theme", theme);
  }, [theme]);

  function toggleTheme() {
    setTheme((currentTheme) => (currentTheme === "light" ? "dark" : "light"));
  }

  return (
    <div
      className={isClient && theme === "dark" ? "dark" : undefined}
      suppressHydrationWarning
    >
      <div className="flex h-screen overflow-hidden bg-background lg:gap-4 lg:p-4">
        {/* Sidebar — only on desktop */}
        <div className="hidden lg:flex lg:h-[calc(100vh-2rem)] lg:shrink-0">
          <PainelSidebar theme={theme} onToggleTheme={toggleTheme} isClient={isClient} />
        </div>

        {/* Mobile sidebar drawer */}
        {mobileOpen && (
          <div className="fixed inset-0 z-40 lg:hidden">
            {/* Backdrop */}
            <div
              className="fixed inset-0 bg-black/50 backdrop-blur-sm"
              onClick={() => setMobileOpen(false)}
              aria-hidden="true"
            />
            {/* Drawer panel */}
            <div className="relative z-50 flex h-full w-72 max-w-[85vw] flex-col p-3 shadow-xl">
              <PainelSidebar
                theme={theme}
                onToggleTheme={toggleTheme}
                isClient={isClient}
                onClose={() => setMobileOpen(false)}
              />
            </div>
          </div>
        )}

        {/* Content area */}
        <div className="flex flex-1 flex-col overflow-hidden lg:min-h-[calc(100vh-2rem)] lg:rounded-[28px] lg:border lg:border-[color:var(--premium-border)] lg:bg-[var(--premium-surface)] lg:shadow-[var(--premium-shadow)]">
          {/* Mobile top header */}
          <header className="premium-glass flex h-14 shrink-0 items-center justify-between px-4 lg:hidden">
            <div className="flex items-center">
              <button
                onClick={() => setMobileOpen(true)}
                className="rounded-xl p-2 text-muted-foreground transition-colors hover:bg-accent/70 hover:text-foreground"
                aria-label="Abrir menu"
              >
                <Menu className="size-5" />
              </button>
              <span className="premium-heading ml-3 text-base">Coach OS</span>
            </div>
            <Button
              type="button"
              variant="premium-ghost"
              size="icon"
              onClick={toggleTheme}
              aria-label={theme === "light" ? "Ativar tema escuro" : "Ativar tema claro"}
            >
              {isClient && theme === "dark" ? (
                <Sun className="size-4" />
              ) : (
                <Moon className="size-4" />
              )}
            </Button>
          </header>

          <main className="flex-1 overflow-y-auto">
            {shouldShowTrialWarning ? (
              <div className="border-b border-amber-500/20 bg-amber-500/10 px-4 py-3 sm:px-8">
                <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-3">
                  <div className="flex items-start gap-2">
                    <AlertTriangle className="mt-0.5 size-4 shrink-0 text-amber-500" />
                    <p className="text-sm text-amber-950 dark:text-amber-100">
                      Seu trial termina em{" "}
                      <span className="font-semibold">
                        {trialDaysRemaining} {trialDaysRemaining === 1 ? "dia" : "dias"}
                      </span>
                      . Regularize sua assinatura para evitar bloqueio de acesso.
                    </p>
                  </div>
                  <Link
                    href="/painel/assinatura"
                    className="text-sm font-medium text-amber-950 underline underline-offset-4 dark:text-amber-100"
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
      <PainelQuickActionsFab />
    </div>
  );
}
