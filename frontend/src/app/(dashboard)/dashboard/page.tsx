"use client"

import { Users, ClipboardList, BookOpen } from "lucide-react"

import { StatsCard } from "@/shared/components/statsCard"
import { PageHeader } from "@/shared/components/pageHeader"
import { useDashboardStats } from "@/features/dashboard/hooks/useDashboardStats"
import { authStore } from "@/stores/authStore"
import { OnboardingChecklist } from "@/features/onboarding/components/onboardingChecklist"

export default function DashboardPage() {
  const { data: stats, isLoading } = useDashboardStats()
  const user = authStore.getUser()

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Olá, ${user?.name?.split(" ")[0] ?? "Coach"} 👋`}
        description="Aqui está um resumo do seu trabalho."
      />

      <OnboardingChecklist />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          label="Alunos ativos"
          value={isLoading ? "—" : String(stats?.activeStudents ?? 0)}
          icon={Users}
        />
        <StatsCard
          label="Total de alunos"
          value={isLoading ? "—" : String(stats?.totalStudents ?? 0)}
          icon={Users}
        />
        <StatsCard
          label="Templates de treino"
          value={isLoading ? "—" : String(stats?.programTemplates ?? 0)}
          icon={BookOpen}
        />
        <StatsCard
          label="Programas ativos"
          value={isLoading ? "—" : String(stats?.activeStudentPrograms ?? 0)}
          icon={ClipboardList}
        />
      </div>
    </div>
  )
}
