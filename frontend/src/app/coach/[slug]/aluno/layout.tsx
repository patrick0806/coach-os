"use client"

import { useEffect, useState, type ReactNode } from "react"
import { useRouter, usePathname } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { CalendarDays, Dumbbell, LogOut, TrendingUp } from "lucide-react"

import { studentAuthStore } from "@/stores/studentAuthStore"
import { studentAuthService } from "@/features/studentAuth/services/studentAuth.service"
import { useCoachHref } from "@/lib/useCoachHref"
import { Button } from "@/shared/ui/button"
import { cn } from "@/lib/utils"

interface CoachBranding {
  coachName: string
  logoUrl: string | null
}

interface StudentLayoutProps {
  children: ReactNode
  params: Promise<{ slug: string }>
}

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3333"

export default function StudentLayout({ children, params }: StudentLayoutProps) {
  const router = useRouter()
  const pathname = usePathname()
  const [branding, setBranding] = useState<CoachBranding | null>(null)
  const [slug, setSlug] = useState<string>("")

  // Unwrap params (async in Next.js 16 App Router)
  useEffect(() => {
    params.then((p) => setSlug(p.slug))
  }, [params])

  const href = useCoachHref(slug)

  const navItems = [
    { path: "/aluno/treinos", label: "Treinos", icon: Dumbbell },
    { path: "/aluno/progresso", label: "Progresso", icon: TrendingUp },
    { path: "/aluno/agenda", label: "Agenda", icon: CalendarDays },
  ]

  useEffect(() => {
    // Guard: redirect to coach LP if student is not authenticated
    if (!studentAuthStore.isAuthenticated() && slug) {
      router.push(href("/"))
    }
  }, [router, slug, href])

  useEffect(() => {
    // Fetch coach branding using slug from URL (primary) or personalSlug from session (fallback)
    const brandingSlug = slug || studentAuthStore.getUser()?.personalSlug
    if (!brandingSlug) return

    fetch(`${BASE_URL}/public/${brandingSlug}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((json) => {
        const profile = json?.data ?? json
        if (profile) {
          setBranding({
            coachName: profile.coachName,
            logoUrl: profile.logoUrl ?? null,
          })
        }
      })
      .catch(() => null)
  }, [slug])

  useEffect(() => {
    // Dynamically update favicon with coach's logo when branding loads
    if (!branding?.logoUrl) return

    const existing = document.querySelector("link[rel~='icon']") as HTMLLinkElement | null
    const link = existing ?? document.createElement("link")
    link.rel = "icon"
    link.href = branding.logoUrl
    if (!existing) document.head.appendChild(link)
  }, [branding?.logoUrl])

  function handleLogout() {
    studentAuthService.logout()
    router.push(href("/"))
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile header */}
      <header className="sticky top-0 z-50 border-b border-border/60 bg-card">
        <div className="flex h-14 items-center justify-between px-4">
          <div className="flex items-center gap-2">
            {branding?.logoUrl ? (
              <div className="flex flex-col leading-none">
                <Image
                  src={branding.logoUrl}
                  alt={branding.coachName}
                  width={100}
                  height={32}
                  className="h-8 w-auto object-contain"
                />
                {branding.coachName && (
                  <span className="text-[10px] text-muted-foreground leading-none mt-0.5">
                    Treinando com {branding.coachName}
                  </span>
                )}
              </div>
            ) : (
              <div className="flex flex-col leading-none">
                <div className="flex items-center gap-2">
                  <Dumbbell className="h-5 w-5 text-primary" />
                  <span className="font-semibold text-sm">
                    {branding?.coachName ?? "Portal do Aluno"}
                  </span>
                </div>
                {branding?.coachName && (
                  <span className="text-[10px] text-muted-foreground leading-none mt-0.5">
                    Treinando com {branding.coachName}
                  </span>
                )}
              </div>
            )}
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
      <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-border/60 bg-card">
        <div className="mx-auto flex max-w-2xl flex-col items-center px-4 pt-2 pb-1">
          <div className="flex w-full items-center justify-around">
            {navItems.map(({ path, label, icon: Icon }) => {
              const fullHref = href(path)
              const isActive = pathname === fullHref || pathname.startsWith(fullHref + "/")
                // Also check without prefix for subdomain mode
                || pathname === path || pathname.startsWith(path + "/")
              return (
                <Link
                  key={path}
                  href={fullHref}
                  className={cn(
                    "flex flex-col items-center gap-1 rounded-full px-4 py-1.5 text-xs transition-colors",
                    isActive
                      ? "bg-primary/10 text-primary"
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
          <p className="text-[10px] text-center text-muted-foreground pb-0.5">
            {branding?.coachName ? `${branding.coachName} · via Coach OS` : "Coach OS"}
          </p>
        </div>
      </nav>
    </div>
  )
}
