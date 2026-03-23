"use client"

import { PageHeader } from "@/shared/components/pageHeader"
import { ChangePasswordForm } from "@/features/settings/components/changePasswordForm"
import { ProfileSettingsSection } from "@/features/settings/components/profileSettingsSection"
import { DeleteAccountSection } from "@/features/settings/components/deleteAccountSection"
import { PageTourInitializer } from "@/features/onboarding/components/pageTourInitializer"
import { startProfileTour } from "@/features/onboarding/tours/profile.tour"

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <PageTourInitializer page="profile" startTour={startProfileTour} />

      <PageHeader
        title="Configuracoes"
        description="Gerencie as configuracoes da sua conta."
      />

      <div data-tour="profile-settings">
        <ProfileSettingsSection />
      </div>

      <div data-tour="change-password-form">
        <ChangePasswordForm />
      </div>

      <DeleteAccountSection />
    </div>
  )
}
