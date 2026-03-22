"use client"

import { useState } from "react"
import { TrendingUp, Plus } from "lucide-react"

import { Button } from "@/shared/ui/button"
import { EmptyState } from "@/shared/components/emptyState"
import { LoadingState } from "@/shared/components/loadingState"
import { useProgressCheckins } from "@/features/progress/hooks/useProgressCheckins"
import { useDeleteCheckin } from "@/features/progress/hooks/useDeleteCheckin"
import { useProgressChartData } from "@/features/progress/hooks/useProgressChartData"
import { CheckinCard } from "@/features/progress/components/checkinCard"
import { CreateCheckinDialog } from "@/features/progress/components/createCheckinDialog"
import { ProgressChart } from "@/features/progress/components/progressChart"
import { CombinedProgressChart } from "@/features/progress/components/combinedProgressChart"
import {
  METRIC_TYPES,
  METRIC_TYPE_LABELS,
  METRIC_TYPE_UNITS,
  type MetricType,
} from "@/features/progress/types/progress.types"

interface StudentProgressSectionProps {
  studentId: string
}

export function StudentProgressSection({ studentId }: StudentProgressSectionProps) {
  const [page, setPage] = useState(0)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [selectedMetric, setSelectedMetric] = useState<MetricType | undefined>(undefined)

  const { data, isLoading } = useProgressCheckins(studentId, { page, size: 10 })
  const deleteCheckin = useDeleteCheckin(studentId)
  const chartQuery = useProgressChartData(studentId, selectedMetric)

  const checkins = data?.content ?? []
  const hasMore = data ? page + 1 < data.totalPages : false

  return (
    <div className="space-y-4" data-testid="student-progress-section">
      <div className="flex items-center justify-between">
        <div />
        <Button
          size="sm"
          onClick={() => setDialogOpen(true)}
          data-testid="register-evolution-button"
        >
          <Plus className="mr-1.5 size-3.5" />
          Registrar Evolução
        </Button>
      </div>

      <div className="flex items-center gap-1 flex-wrap" data-testid="metric-selector">
        <Button
          size="sm"
          variant={selectedMetric === undefined ? "default" : "outline"}
          onClick={() => setSelectedMetric(undefined)}
        >
          Todos
        </Button>
        {METRIC_TYPES.map((type) => (
          <Button
            key={type}
            size="sm"
            variant={selectedMetric === type ? "default" : "outline"}
            onClick={() => setSelectedMetric(type)}
          >
            {METRIC_TYPE_LABELS[type]}
          </Button>
        ))}
      </div>

      {selectedMetric ? (
        <ProgressChart
          data={chartQuery.data ?? []}
          label={METRIC_TYPE_LABELS[selectedMetric]}
          unit={METRIC_TYPE_UNITS[selectedMetric]}
          isLoading={chartQuery.isLoading}
        />
      ) : (
        <CombinedProgressChart
          data={chartQuery.data ?? []}
          isLoading={chartQuery.isLoading}
        />
      )}

      {isLoading ? (
        <LoadingState variant="list" />
      ) : checkins.length === 0 ? (
        <EmptyState
          icon={TrendingUp}
          title="Nenhum registro de evolução"
          description="Registre o primeiro check-in de evolução do aluno."
          action={
            <Button size="sm" onClick={() => setDialogOpen(true)}>
              <Plus className="mr-1.5 size-3.5" />
              Registrar Evolução
            </Button>
          }
        />
      ) : (
        <div className="space-y-3">
          {checkins.map((checkin) => (
            <CheckinCard
              key={checkin.id}
              checkin={checkin}
              onDelete={(id) => deleteCheckin.mutate(id)}
            />
          ))}

          {hasMore && (
            <Button
              variant="outline"
              className="w-full"
              onClick={() => setPage((p) => p + 1)}
            >
              Carregar mais
            </Button>
          )}
        </div>
      )}

      <CreateCheckinDialog
        studentId={studentId}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
      />
    </div>
  )
}
