"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  CalendarDays,
  ClipboardList,
  CreditCard,
  Dumbbell,
  LayoutDashboard,
  LogOut,
  Moon,
  Sun,
  User,
  Users,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/painel", label: "Início", icon: LayoutDashboard, exact: true },
  { href: "/painel/perfil", label: "Meu Perfil", icon: User, exact: false },
  { href: "/painel/alunos", label: "Alunos", icon: Users, exact: false },
  { href: "/painel/treinos", label: "Treinos", icon: Dumbbell, exact: false },
  { href: "/painel/agenda", label: "Agenda", icon: CalendarDays, exact: false },
  { href: "/painel/planos-servico", label: "Planos de Serviço", icon: ClipboardList, exact: false },
  { href: "/painel/assinatura", label: "Assinatura", icon: CreditCard, exact: false },
];

interface PainelSidebarProps {
  theme: "light" | "dark";
  onToggleTheme: () => void;
  isClient: boolean;
  onClose?: () => void;
}

export function PainelSidebar({
  theme,
  onToggleTheme,
  isClient,
  onClose,
}: PainelSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { signOut } = useAuth();

  async function handleSignOut() {
    onClose?.();
    await signOut();
    router.push("/login");
  }

  return (
    <aside className="premium-glass flex h-full w-64 flex-col border-r-0 lg:m-4 lg:rounded-3xl">
      <div className="premium-divider flex h-16 items-center border-b px-6">
        <span className="premium-heading text-lg">Coach OS</span>
      </div>

      <nav className="flex-1 overflow-y-auto p-3">
        <ul className="space-y-0.5">
          {navItems.map((item) => {
            const isActive = item.exact
              ? pathname === item.href
              : pathname.startsWith(item.href);
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  onClick={onClose}
                  className={cn(
                    "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all",
                    isActive
                      ? "premium-highlight text-primary-foreground shadow-[var(--premium-shadow)]"
                      : "text-muted-foreground hover:bg-accent/70 hover:text-foreground",
                  )}
                >
                  <item.icon className="size-4 shrink-0" />
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="premium-divider border-t p-3">
        <Button
          type="button"
          variant="ghost"
          className="mb-1 flex w-full items-center justify-start gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground"
          onClick={onToggleTheme}
        >
          {isClient && theme === "dark" ? (
            <Sun className="size-4 shrink-0" />
          ) : (
            <Moon className="size-4 shrink-0" />
          )}
          {isClient && theme === "dark" ? "Tema claro" : "Tema escuro"}
        </Button>
        <button
          onClick={handleSignOut}
          className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-muted-foreground transition-all hover:bg-red-500/10 hover:text-red-500"
        >
          <LogOut className="size-4 shrink-0" />
          Sair
        </button>
      </div>
    </aside>
  );
}
