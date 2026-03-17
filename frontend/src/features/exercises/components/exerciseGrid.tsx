"use client"

import { Dumbbell } from "lucide-react"
import { motion } from "framer-motion"

import { EmptyState } from "@/shared/components/emptyState"
import { Skeleton } from "@/shared/ui/skeleton"
import { ExerciseCard } from "@/features/exercises/components/exerciseCard"
import type { ExerciseItem } from "@/features/exercises/types/exercises.types"

interface ExerciseGridProps {
  exercises: ExerciseItem[]
  isLoading: boolean
  hasFilters: boolean
  onView: (exercise: ExerciseItem) => void
  onEdit: (exercise: ExerciseItem) => void
  onDelete: (exercise: ExerciseItem) => void
}

const staggerContainer = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.04 },
  },
}

const fadeIn = {
  hidden: { opacity: 0, y: 8 },
  show: { opacity: 1, y: 0, transition: { duration: 0.2 } },
}

function SkeletonGrid() {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="overflow-hidden rounded-lg border bg-card">
          <Skeleton className="h-40 w-full rounded-none" />
          <div className="p-4 space-y-2">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-1/2" />
          </div>
        </div>
      ))}
    </div>
  )
}

export function ExerciseGrid({
  exercises,
  isLoading,
  hasFilters,
  onView,
  onEdit,
  onDelete,
}: ExerciseGridProps) {
  if (isLoading) {
    return <SkeletonGrid />
  }

  if (!exercises.length) {
    return (
      <EmptyState
        icon={Dumbbell}
        title="Nenhum exercício encontrado"
        description={
          hasFilters
            ? "Tente ajustar os filtros de busca."
            : "A biblioteca de exercícios está vazia."
        }
      />
    )
  }

  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      animate="show"
      className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
    >
      {exercises.map((exercise) => (
        <motion.div key={exercise.id} variants={fadeIn}>
          <ExerciseCard
            exercise={exercise}
            onView={onView}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        </motion.div>
      ))}
    </motion.div>
  )
}
