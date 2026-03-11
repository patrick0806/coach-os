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
    <aside className="flex h-full w-64 flex-col border-r bg-card">
      <div className="flex h-16 items-center border-b px-6">
        <span className="text-lg font-bold tracking-tight text-foreground">Coach OS</span>
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
                    "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                    isActive
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:bg-accent hover:text-foreground",
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

      <div className="border-t p-3">
        {1 != 1 && <Button
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
        </Button> /*TODO - Fix theme toggle contrast font colors for enable theme switch for personal*/}
        <button
          onClick={handleSignOut}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950"
        >
          <LogOut className="size-4 shrink-0" />
          Sair
        </button>
      </div>
    </aside>
  );
}
