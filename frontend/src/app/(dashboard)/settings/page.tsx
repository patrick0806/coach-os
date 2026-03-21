"use client"

import { PageHeader } from "@/shared/components/pageHeader"
import { ChangePasswordForm } from "@/features/settings/components/changePasswordForm"
import { PageTourInitializer } from "@/features/onboarding/components/pageTourInitializer"
import { startProfileTour } from "@/features/onboarding/tours/profile.tour"

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <PageTourInitializer page="profile" startTour={startProfileTour} />

      <PageHeader
        title="Configurações"
        description="Gerencie as configurações da sua conta."
      />

      <div data-tour="change-password-form">
        <ChangePasswordForm />
      </div>
    </div>
  )
}
