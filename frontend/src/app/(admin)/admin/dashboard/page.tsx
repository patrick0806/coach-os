"use client";

import { BarChart3, Users, UserCheck, UserPlus, Shield } from "lucide-react";

import { StatsCard } from "@/shared/components/statsCard";
import { PageHeader } from "@/shared/components/pageHeader";
import { useAdminStats } from "@/features/admin/hooks/useAdminStats";

export default function AdminDashboardPage() {
  const { data: stats, isLoading } = useAdminStats();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Admin Dashboard"
        description="Visão geral da plataforma."
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        <StatsCard
          label="Total de Coaches"
          value={isLoading ? "—" : String(stats?.totalCoaches ?? 0)}
          icon={Users}
        />
        <StatsCard
          label="Coaches Pagantes"
          value={isLoading ? "—" : String(stats?.payingCoaches ?? 0)}
          icon={UserCheck}
        />
        <StatsCard
          label="Novos este Mês"
          value={isLoading ? "—" : String(stats?.newThisMonth ?? 0)}
          icon={UserPlus}
        />
        <StatsCard
          label="Total de Alunos"
          value={isLoading ? "—" : String(stats?.totalStudents ?? 0)}
          icon={BarChart3}
        />
        <StatsCard
          label="Whitelisted"
          value={isLoading ? "—" : String(stats?.whitelistedCoaches ?? 0)}
          icon={Shield}
        />
      </div>
    </div>
  );
}
