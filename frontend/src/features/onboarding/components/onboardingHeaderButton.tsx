'use client'

import { GraduationCap } from 'lucide-react'
import { usePathname } from 'next/navigation'

import { Button } from '@/shared/ui/button'
import { authStore } from '@/stores/authStore'
import { SHOW_TUTORIAL } from '@/features/onboarding/config'
import { getTourForPathname } from '@/features/onboarding/tours/index'

export function OnboardingHeaderButton() {
  const pathname = usePathname()
  const user = authStore.getUser()

  if (!SHOW_TUTORIAL) return null
  if (user?.role !== 'PERSONAL') return null

  const tour = getTourForPathname(pathname)
  if (!tour) return null

  return (
    <Button
      variant="outline"
      size="sm"
      className="gap-1.5 text-xs"
      onClick={() => tour.startTour()}
    >
      <GraduationCap className="size-3.5" />
      Tutorial
    </Button>
  )
}
