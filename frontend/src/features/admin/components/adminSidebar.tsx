"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { BarChart3, CreditCard, Dumbbell, LogOut, Shield, Users, List } from "lucide-react";

import { authStore } from "@/stores/authStore";
import { Button } from "@/shared/ui/button";
import { cn } from "@/lib/utils";

const navItems = [
  { label: "Dashboard", href: "/admin/dashboard", icon: BarChart3 },
  { label: "Planos", href: "/admin/planos", icon: CreditCard },
  { label: "Whitelist", href: "/admin/whitelist", icon: Shield },
  { label: "Admins", href: "/admin/admins", icon: Users },
  { label: "Tenants", href: "/admin/tenants", icon: List },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const user = authStore.getUser();

  function isActive(href: string) {
    return pathname.startsWith(href);
  }

  function handleLogout() {
    authStore.clear();
    router.push("/login");
  }

  return (
    <aside className="hidden w-64 shrink-0 border-r border-sidebar-border lg:flex lg:flex-col bg-sidebar text-sidebar-foreground">
      <div className="flex h-16 shrink-0 items-center gap-3 border-b border-sidebar-border px-6">
        <div className="flex size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
          <Dumbbell className="size-4" />
        </div>
        <div>
          <span className="font-bold tracking-tight">Coach OS</span>
          <p className="text-xs text-muted-foreground">Admin</p>
        </div>
      </div>

      <nav className="flex-1 space-y-1 p-4 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                active
                  ? "bg-sidebar-accent text-sidebar-accent-foreground"
                  : "hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground"
              )}
            >
              <Icon className="size-4 shrink-0" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="shrink-0 border-t border-sidebar-border p-4">
        <div className="flex items-center gap-3 px-3 py-2 mb-2">
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{user?.name ?? "Admin"}</p>
            <p className="text-xs text-muted-foreground truncate">
              {user?.email ?? ""}
            </p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="size-8 shrink-0 hover:text-destructive"
            onClick={handleLogout}
            title="Sair"
          >
            <LogOut className="size-4" />
          </Button>
        </div>
      </div>
    </aside>
  );
}
