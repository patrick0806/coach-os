"use client"

import { useState } from "react"
import { Plus, TrendingUp } from "lucide-react"

import { useStudentMyCheckins } from "@/features/studentPortal/hooks/useStudentMyCheckins"
import { useStudentMyChartData } from "@/features/studentPortal/hooks/useStudentMyChartData"
import { CheckinCard } from "@/features/studentPortal/components/checkinCard"
import { CreateStudentCheckinDialog } from "@/features/studentPortal/components/createStudentCheckinDialog"
import { ProgressChart } from "@/features/progress/components/progressChart"
import { CombinedProgressChart } from "@/features/progress/components/combinedProgressChart"
import { EmptyState } from "@/shared/components/emptyState"
import { LoadingState } from "@/shared/components/loadingState"
import { Button } from "@/shared/ui/button"
import {
  METRIC_TYPES,
  METRIC_TYPE_LABELS,
  METRIC_TYPE_UNITS,
  type MetricType,
} from "@/features/progress/types/progress.types"

export default function StudentProgressoPage() {
  const [dialogOpen, setDialogOpen] = useState(false)
  const [selectedMetric, setSelectedMetric] = useState<MetricType | undefined>(undefined)
  const { data, isLoading } = useStudentMyCheckins({ page: 0, size: 20 })
  const chartQuery = useStudentMyChartData(selectedMetric)

  const checkins = data?.content ?? []

  return (
    <>
      <div className="space-y-4" data-testid="checkins-page">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Meu Progresso</h2>
          <Button
            size="sm"
            onClick={() => setDialogOpen(true)}
            data-testid="add-checkin-button"
          >
            <Plus className="mr-1.5 h-4 w-4" />
            Registrar
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
            title="Nenhum registro de progresso"
            description="Registre sua evolução com métricas e fotos."
            data-testid="empty-state"
          />
        ) : (
          <div className="space-y-3" data-testid="checkins-list">
            {checkins.map((checkin) => (
              <CheckinCard key={checkin.id} checkin={checkin} />
            ))}
          </div>
        )}
      </div>

      <CreateStudentCheckinDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
      />
    </>
  )
}
