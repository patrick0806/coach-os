"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { CalendarDays, Dumbbell, LayoutDashboard, LogOut } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { cn } from "@/lib/utils";

interface StudentShellProps {
  slug: string;
  children: React.ReactNode;
}

export function StudentShell({ slug, children }: StudentShellProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { signOut } = useAuth();

  const navItems = [
    { href: `/${slug}/alunos/painel`, label: "Início", icon: LayoutDashboard },
    { href: `/${slug}/alunos/treinos`, label: "Treinos", icon: Dumbbell },
    { href: `/${slug}/alunos/agenda`, label: "Agenda", icon: CalendarDays },
  ];

  async function handleSignOut() {
    await signOut();
    router.push(`/${slug}/login`);
  }

  return (
    <div className="flex min-h-screen flex-col">
      <header className="premium-glass sticky top-0 z-20 hidden border-b-0 md:block">
        <div className="mx-auto flex h-14 max-w-3xl items-center justify-between px-4">
          <span className="premium-heading text-sm">Coach OS</span>
          <nav className="flex items-center gap-1">
            {navItems.map((item) => {
              const isActive = pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-sm font-medium transition-all",
                    isActive
                      ? "premium-highlight text-primary-foreground shadow-[var(--premium-shadow)]"
                      : "text-muted-foreground hover:bg-accent/70 hover:text-accent-foreground",
                  )}
                >
                  <item.icon className="size-3.5 shrink-0" />
                  {item.label}
                </Link>
              );
            })}
          </nav>
          <Button
            onClick={handleSignOut}
            variant="premium-ghost"
            size="sm"
            className="gap-1.5 px-2.5 text-muted-foreground hover:text-destructive"
          >
            <LogOut className="size-3.5" />
            <span className="hidden sm:inline">Sair</span>
          </Button>
        </div>
      </header>
      <main className="flex-1 pb-24 md:pb-0">{children}</main>
      <nav className="premium-glass fixed inset-x-3 bottom-3 z-30 rounded-[28px] p-2 md:hidden">
        <ul className="grid grid-cols-4 gap-1">
          {navItems.map((item) => {
            const isActive = pathname.startsWith(item.href);
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={cn(
                    "flex flex-col items-center justify-center gap-1 rounded-2xl px-2 py-2 text-[11px] font-medium transition-all",
                    isActive
                      ? "premium-highlight text-primary-foreground shadow-[var(--premium-shadow)]"
                      : "text-muted-foreground hover:bg-accent/60 hover:text-foreground",
                  )}
                >
                  <item.icon className="size-4 shrink-0" />
                  <span>{item.label}</span>
                </Link>
              </li>
            );
          })}
          <li>
            <button
              onClick={handleSignOut}
              className="flex w-full flex-col items-center justify-center gap-1 rounded-2xl px-2 py-2 text-[11px] font-medium text-muted-foreground transition-all hover:bg-red-500/10 hover:text-red-500"
            >
              <LogOut className="size-4 shrink-0" />
              <span>Sair</span>
            </button>
          </li>
        </ul>
      </nav>
    </div>
  );
}
