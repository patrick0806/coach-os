"use client"

import { useState } from "react"
import { Plus, TrendingUp } from "lucide-react"

import { useStudentMyCheckins } from "@/features/studentPortal/hooks/useStudentMyCheckins"
import { CheckinCard } from "@/features/studentPortal/components/checkinCard"
import { CreateStudentCheckinDialog } from "@/features/studentPortal/components/createStudentCheckinDialog"
import { EmptyState } from "@/shared/components/emptyState"
import { LoadingState } from "@/shared/components/loadingState"
import { Button } from "@/shared/ui/button"

export default function StudentProgressoPage() {
  const [dialogOpen, setDialogOpen] = useState(false)
  const { data, isLoading } = useStudentMyCheckins({ page: 0, size: 20 })

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
