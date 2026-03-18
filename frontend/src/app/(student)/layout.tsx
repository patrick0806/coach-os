"use client"

import { useEffect, type ReactNode } from "react"
import { useRouter, usePathname } from "next/navigation"
import Link from "next/link"
import { CalendarDays, Dumbbell, LogOut, TrendingUp } from "lucide-react"

import { studentAuthStore } from "@/stores/studentAuthStore"
import { studentAuthService } from "@/features/studentAuth/services/studentAuth.service"
import { Button } from "@/shared/ui/button"
import { cn } from "@/lib/utils"

interface StudentLayoutProps {
  children: ReactNode
}

const NAV_ITEMS = [
  { href: "/aluno/treinos", label: "Treinos", icon: Dumbbell },
  { href: "/aluno/progresso", label: "Progresso", icon: TrendingUp },
  { href: "/aluno/agenda", label: "Agenda", icon: CalendarDays },
]

export default function StudentLayout({ children }: StudentLayoutProps) {
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    // Guard: redirect to home if student is not authenticated
    if (!studentAuthStore.isAuthenticated()) {
      router.push("/")
    }
  }, [router])

  const user = studentAuthStore.getUser()

  function handleLogout() {
    studentAuthService.logout()
    router.push("/")
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile header */}
      <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex h-14 items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <Dumbbell className="h-5 w-5 text-primary" />
            <span className="font-semibold text-sm">
              {user?.name ?? "Portal do Aluno"}
            </span>
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={handleLogout}
            className="gap-1.5"
            data-testid="logout-button"
          >
            <LogOut className="h-4 w-4" />
            <span className="hidden sm:inline">Sair</span>
          </Button>
        </div>
      </header>

      <main className="mx-auto max-w-2xl px-4 py-6 pb-24">{children}</main>

      {/* Bottom navigation */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="mx-auto flex max-w-2xl items-center justify-around px-4 py-2">
          {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
            const isActive =
              pathname === href || pathname.startsWith(href + "/")
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  "flex flex-col items-center gap-1 px-4 py-1 text-xs transition-colors",
                  isActive
                    ? "text-primary"
                    : "text-muted-foreground hover:text-foreground",
                )}
                data-testid={`nav-${label.toLowerCase()}`}
              >
                <Icon className="h-5 w-5" />
                <span>{label}</span>
              </Link>
            )
          })}
        </div>
      </nav>
    </div>
  )
}
