"use client"

import { useRouter, usePathname } from "next/navigation"
import Link from "next/link"
import {
  Calendar,
  ClipboardList,
  Clock,
  Dumbbell,
  Globe,
  LayoutDashboard,
  LogOut,
  Menu,
  Package,
  Settings,
  Users,
} from "lucide-react"

import { Avatar, AvatarFallback } from "@/shared/ui/avatar"
import { Button } from "@/shared/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/shared/ui/sheet"
import { Separator } from "@/shared/ui/separator"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/shared/ui/tooltip"
import { authStore } from "@/stores/authStore"
import { cn } from "@/lib/utils"

const navItems = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Alunos", href: "/students", icon: Users },
  { label: "Exercícios", href: "/exercises", icon: Dumbbell },
  { label: "Treinos", href: "/training-templates", icon: ClipboardList },
  { label: "Agenda", href: "/agenda", icon: Calendar },
  { label: "Disponibilidade", href: "/disponibilidade", icon: Clock },
  { label: "Serviços", href: "/services", icon: Package, disabled: true },
  { label: "Página Pública", href: "/perfil", icon: Globe, disabled: true },
]

function SidebarContent({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname()
  const router = useRouter()
  const user = authStore.getUser()

  function isActive(href: string) {
    if (href === "/dashboard") return pathname === href
    return pathname.startsWith(href)
  }

  function handleLogout() {
    authStore.clear()
    router.push("/login")
  }

  return (
    <div className="flex h-full flex-col bg-sidebar text-sidebar-foreground">
      <div className="flex h-16 shrink-0 items-center gap-3 border-b border-sidebar-border px-6">
        <div className="flex size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
          <Dumbbell className="size-4" />
        </div>
        <span className="font-bold tracking-tight">Coach OS</span>
      </div>

      <nav className="flex-1 space-y-1 p-4 overflow-y-auto">
        <TooltipProvider>
          {navItems.map((item) => {
            const Icon = item.icon
            const active = isActive(item.href)

            if (item.disabled) {
              return (
                <Tooltip key={item.href}>
                  <TooltipTrigger asChild>
                    <div
                      className={cn(
                        "flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm font-medium",
                        "pointer-events-none opacity-40"
                      )}
                    >
                      <Icon className="size-4 shrink-0" />
                      {item.label}
                    </div>
                  </TooltipTrigger>
                  <TooltipContent side="right">Em breve</TooltipContent>
                </Tooltip>
              )
            }

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onNavigate}
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
            )
          })}
        </TooltipProvider>
      </nav>

      <div className="shrink-0 border-t border-sidebar-border p-4 space-y-1">
        <Link
          href="/settings"
          className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm font-medium hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground transition-colors opacity-40 pointer-events-none"
          onClick={onNavigate}
        >
          <Settings className="size-4 shrink-0" />
          Configurações
        </Link>
        <Separator className="my-2 bg-sidebar-border" />
        <div className="flex items-center gap-3 px-3 py-2">
          <Avatar className="size-8 shrink-0">
            <AvatarFallback className="text-xs bg-sidebar-accent text-sidebar-accent-foreground">
              {user?.name?.slice(0, 2).toUpperCase() ?? "??"}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{user?.name ?? "Usuário"}</p>
            <p className="text-xs text-muted-foreground truncate">{user?.email ?? ""}</p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="size-8 shrink-0 hover:text-destructive"
            onClick={handleLogout}
            title="Sair"
          >
            <LogOut className="size-4" />
            <span className="sr-only">Sair</span>
          </Button>
        </div>
      </div>
    </div>
  )
}

export function Sidebar() {
  return (
    <aside className="hidden w-64 shrink-0 border-r border-sidebar-border lg:flex lg:flex-col">
      <SidebarContent />
    </aside>
  )
}

export function MobileSidebarTrigger() {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="size-8 lg:hidden">
          <Menu className="size-5" />
          <span className="sr-only">Abrir menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-64 p-0">
        <SidebarContent />
      </SheetContent>
    </Sheet>
  )
}
