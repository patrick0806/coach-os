"use client"

import { useState } from "react"
import { TrendingUp, Plus } from "lucide-react"

import { Button } from "@/shared/ui/button"
import { EmptyState } from "@/shared/components/emptyState"
import { LoadingState } from "@/shared/components/loadingState"
import { useProgressCheckins } from "@/features/progress/hooks/useProgressCheckins"
import { useDeleteCheckin } from "@/features/progress/hooks/useDeleteCheckin"
import { CheckinCard } from "@/features/progress/components/checkinCard"
import { CreateCheckinDialog } from "@/features/progress/components/createCheckinDialog"

interface StudentProgressSectionProps {
  studentId: string
}

export function StudentProgressSection({ studentId }: StudentProgressSectionProps) {
  const [page, setPage] = useState(0)
  const [dialogOpen, setDialogOpen] = useState(false)

  const { data, isLoading } = useProgressCheckins(studentId, { page, size: 10 })
  const deleteCheckin = useDeleteCheckin(studentId)

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
