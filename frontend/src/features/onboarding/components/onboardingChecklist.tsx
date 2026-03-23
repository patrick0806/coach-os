'use client'

import Link from 'next/link'
import { CheckCircle2, Circle, GraduationCap, X } from 'lucide-react'
import { useState } from 'react'

import { Card, CardContent, CardHeader } from '@/shared/ui/card'
import { Button } from '@/shared/ui/button'
import { authStore } from '@/stores/authStore'
import { SHOW_TUTORIAL, TOUR_PAGES, type TourPage } from '@/features/onboarding/config'
import { useTourProgress } from '@/features/onboarding/hooks/useTourProgress'

interface TourPageMeta {
  label: string
  href: string
}

const PAGE_META: Record<TourPage, TourPageMeta> = {
  exercises: { label: 'Biblioteca de Exercícios', href: '/exercises' },
  students: { label: 'Alunos', href: '/students' },
  training: { label: 'Programas de Treino', href: '/training-templates' },
  schedule: { label: 'Agenda', href: '/agenda' },
  availability: { label: 'Disponibilidade', href: '/disponibilidade' },
  services: { label: 'Planos de Serviço', href: '/services' },
  landingPage: { label: 'Página Pública', href: '/pagina-publica' },
  profile: { label: 'Configurações', href: '/settings' },
}

export function OnboardingChecklist() {
  const user = authStore.getUser()
  const [dismissed, setDismissed] = useState(false)
  const { completedPages } = useTourProgress()

  if (!SHOW_TUTORIAL) return null
  if (user?.role !== 'PERSONAL') return null
  if (user?.onboardingCompleted) return null
  if (completedPages.length >= TOUR_PAGES.length) return null
  if (dismissed) return null

  const completedCount = completedPages.length
  const total = TOUR_PAGES.length

  return (
    <Card variant="glass" className="relative overflow-hidden" data-testid="onboarding-checklist">
      <div className="absolute inset-x-0 top-0 h-1 bg-muted">
        <div
          className="h-full bg-primary transition-all duration-500"
          style={{ width: `${(completedCount / total) * 100}%` }}
        />
      </div>

      <CardHeader className="pb-3 pt-5">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2">
            <div className="rounded-lg bg-primary/10 p-1.5">
              <GraduationCap className="size-4 text-primary" />
            </div>
            <div>
              <p className="text-sm font-semibold">Primeiros passos</p>
              <p className="text-xs text-muted-foreground">
                {completedCount} de {total} módulos visitados
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="size-7 shrink-0 text-muted-foreground hover:text-foreground"
            onClick={() => setDismissed(true)}
          >
            <X className="size-3.5" />
          </Button>
        </div>
      </CardHeader>

      <CardContent className="pb-5">
        <ul className="space-y-1.5">
          {TOUR_PAGES.map((page) => {
            const meta = PAGE_META[page]
            const done = completedPages.includes(page)
            return (
              <li key={page}>
                <Link
                  href={meta.href}
                  className="flex items-center gap-2.5 rounded-md px-2 py-1.5 text-sm transition-colors hover:bg-accent"
                >
                  {done ? (
                    <CheckCircle2 className="size-4 shrink-0 text-success" />
                  ) : (
                    <Circle className="size-4 shrink-0 text-muted-foreground" />
                  )}
                  <span className={done ? 'text-muted-foreground line-through' : ''}>
                    {meta.label}
                  </span>
                </Link>
              </li>
            )
          })}
        </ul>
      </CardContent>
    </Card>
  )
}
