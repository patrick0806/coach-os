"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { CalendarDays, Dumbbell, LayoutDashboard, LogOut } from "lucide-react";

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
      <header className="sticky top-0 z-10 border-b border-border/40 bg-background/95 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-3xl items-center justify-between px-4">
          <span className="text-sm font-semibold tracking-tight text-foreground">Coach OS</span>
          <nav className="flex items-center gap-1">
            {navItems.map((item) => {
              const isActive = pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
                    isActive
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
                  )}
                >
                  <item.icon className="size-3.5 shrink-0" />
                  {item.label}
                </Link>
              );
            })}
          </nav>
          <button
            onClick={handleSignOut}
            className="flex items-center gap-1.5 rounded-md px-2 py-1.5 text-sm text-muted-foreground transition-colors hover:text-destructive"
          >
            <LogOut className="size-3.5" />
            <span className="hidden sm:inline">Sair</span>
          </button>
        </div>
      </header>
      <main className="flex-1">{children}</main>
    </div>
  );
}
