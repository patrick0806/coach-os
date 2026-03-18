"use client"

import { useEffect, type ReactNode } from "react"
import { useRouter } from "next/navigation"
import { Dumbbell, LogOut } from "lucide-react"

import { studentAuthStore } from "@/stores/studentAuthStore"
import { studentAuthService } from "@/features/studentAuth/services/studentAuth.service"
import { Button } from "@/shared/ui/button"

interface StudentLayoutProps {
  children: ReactNode
}

export default function StudentLayout({ children }: StudentLayoutProps) {
  const router = useRouter()

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

      <main className="mx-auto max-w-2xl px-4 py-6">{children}</main>
    </div>
  )
}
