"use client"

import { ClipboardList } from "lucide-react"
import { motion } from "framer-motion"

import { EmptyState } from "@/shared/components/emptyState"
import { Skeleton } from "@/shared/ui/skeleton"
import { TemplateCard } from "@/features/trainingTemplates/components/templateCard"
import type { ProgramTemplateItem } from "@/features/trainingTemplates/types/trainingTemplates.types"

interface TemplateGridProps {
  templates: ProgramTemplateItem[]
  isLoading: boolean
  hasFilters: boolean
  onEdit: (template: ProgramTemplateItem) => void
  onDelete: (template: ProgramTemplateItem) => void
  onDuplicate: (template: ProgramTemplateItem) => void
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
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="overflow-hidden rounded-lg border bg-card p-4 space-y-3">
          <div className="flex items-center gap-2">
            <Skeleton className="size-8 rounded-lg" />
            <div className="flex-1 space-y-1">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-1/4" />
            </div>
          </div>
          <Skeleton className="h-3 w-full" />
        </div>
      ))}
    </div>
  )
}

export function TemplateGrid({
  templates,
  isLoading,
  hasFilters,
  onEdit,
  onDelete,
  onDuplicate,
}: TemplateGridProps) {
  if (isLoading) {
    return <SkeletonGrid />
  }

  if (!templates.length) {
    return (
      <EmptyState
        icon={ClipboardList}
        title="Nenhum programa encontrado"
        description={
          hasFilters
            ? "Tente ajustar os filtros de busca."
            : "Crie seu primeiro programa de treino."
        }
      />
    )
  }

  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      animate="show"
      className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3"
    >
      {templates.map((template) => (
        <motion.div key={template.id} variants={fadeIn}>
          <TemplateCard
            template={template}
            onEdit={onEdit}
            onDelete={onDelete}
            onDuplicate={onDuplicate}
          />
        </motion.div>
      ))}
    </motion.div>
  )
}
