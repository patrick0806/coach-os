"use client"

import { PageHeader } from "@/shared/components/pageHeader"
import { ChangePasswordForm } from "@/features/settings/components/changePasswordForm"

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Configurações"
        description="Gerencie as configurações da sua conta."
      />

      <ChangePasswordForm />
    </div>
  )
}
