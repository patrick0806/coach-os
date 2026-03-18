"use client"

import { Suspense, useState } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { Plus } from "lucide-react"

import { Button } from "@/shared/ui/button"
import { LoadingState } from "@/shared/components/loadingState"
import { PageHeader } from "@/shared/components/pageHeader"
import { ExerciseFilters } from "@/features/exercises/components/exerciseFilters"
import { ExerciseGrid } from "@/features/exercises/components/exerciseGrid"
import { ExerciseFormDialog } from "@/features/exercises/components/exerciseFormDialog"
import { ExerciseDetailDialog } from "@/features/exercises/components/exerciseDetailDialog"
import { DeleteExerciseDialog } from "@/features/exercises/components/deleteExerciseDialog"
import { useExercises } from "@/features/exercises/hooks/useExercises"
import type { ExerciseItem } from "@/features/exercises/types/exercises.types"

function ExercisesContent() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [createOpen, setCreateOpen] = useState(false)
  const [editExercise, setEditExercise] = useState<ExerciseItem | null>(null)
  const [viewExercise, setViewExercise] = useState<ExerciseItem | null>(null)
  const [deleteExercise, setDeleteExercise] = useState<ExerciseItem | null>(null)

  const search = searchParams.get("search") ?? ""
  const muscleGroup = searchParams.get("muscleGroup") ?? undefined
  const page = Number(searchParams.get("page") ?? "0")

  const { data, isLoading } = useExercises({ search, muscleGroup, page, size: 9 })

  function updateParam(key: string, value: string | undefined) {
    const params = new URLSearchParams(searchParams.toString())
    if (value) {
      params.set(key, value)
    } else {
      params.delete(key)
    }
    if (key !== "page") params.delete("page")
    router.replace(`/exercises?${params.toString()}`)
  }

  const hasFilters = !!(search || muscleGroup)

  return (
    <div className="space-y-6">
      <PageHeader
        title="Exercícios"
        description="Biblioteca de exercícios da plataforma e seus exercícios personalizados"
        actions={
          <Button onClick={() => setCreateOpen(true)}>
            <Plus className="mr-2 size-4" />
            Criar exercício
          </Button>
        }
      />

      <ExerciseFilters
        search={search}
        onSearchChange={(val) => updateParam("search", val || undefined)}
        muscleGroup={muscleGroup}
        onMuscleGroupChange={(val) => updateParam("muscleGroup", val)}
      />

      <ExerciseGrid
        exercises={data?.content ?? []}
        isLoading={isLoading}
        hasFilters={hasFilters}
        onView={(ex) => setViewExercise(ex)}
        onEdit={(ex) => setEditExercise(ex)}
        onDelete={(ex) => setDeleteExercise(ex)}
      />

      {data && data.totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 py-2">
          <Button
            variant="outline"
            size="sm"
            disabled={page === 0}
            onClick={() => updateParam("page", String(page - 1))}
          >
            Anterior
          </Button>
          <span className="text-sm text-muted-foreground">
            Página {page + 1} de {data.totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={page + 1 >= data.totalPages}
            onClick={() => updateParam("page", String(page + 1))}
          >
            Próximo
          </Button>
        </div>
      )}

      <ExerciseFormDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
      />

      {editExercise && (
        <ExerciseFormDialog
          open={!!editExercise}
          onOpenChange={(open) => !open && setEditExercise(null)}
          exercise={editExercise}
        />
      )}

      <ExerciseDetailDialog
        exercise={viewExercise}
        open={!!viewExercise}
        onOpenChange={(open) => !open && setViewExercise(null)}
        onEdit={(ex) => {
          setViewExercise(null)
          setEditExercise(ex)
        }}
      />

      <DeleteExerciseDialog
        exercise={deleteExercise}
        open={!!deleteExercise}
        onOpenChange={(open) => !open && setDeleteExercise(null)}
      />
    </div>
  )
}

export default function ExercisesPage() {
  return (
    <Suspense fallback={<LoadingState variant="page" />}>
      <ExercisesContent />
    </Suspense>
  )
}
