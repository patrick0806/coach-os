"use client"

import { Suspense, useState } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { Plus } from "lucide-react"

import { Button } from "@/shared/ui/button"
import { LoadingState } from "@/shared/components/loadingState"
import { PageHeader } from "@/shared/components/pageHeader"
import { TemplateFilters } from "@/features/trainingTemplates/components/templateFilters"
import { TemplateGrid } from "@/features/trainingTemplates/components/templateGrid"
import { ProgramTemplateFormDialog } from "@/features/trainingTemplates/components/programTemplateFormDialog"
import { DeleteProgramTemplateDialog } from "@/features/trainingTemplates/components/deleteProgramTemplateDialog"
import { useProgramTemplates } from "@/features/trainingTemplates/hooks/useProgramTemplates"
import { useDuplicateProgramTemplate } from "@/features/trainingTemplates/hooks/useDuplicateProgramTemplate"
import type {
  ProgramTemplateItem,
  ProgramTemplateStatus,
} from "@/features/trainingTemplates/types/trainingTemplates.types"

function TrainingTemplatesContent() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [createOpen, setCreateOpen] = useState(false)
  const [editTemplate, setEditTemplate] = useState<ProgramTemplateItem | null>(null)
  const [deleteTemplate, setDeleteTemplate] = useState<ProgramTemplateItem | null>(null)

  const search = searchParams.get("search") ?? ""
  const status = (searchParams.get("status") as ProgramTemplateStatus | null) ?? undefined
  const page = Number(searchParams.get("page") ?? "0")

  const { data, isLoading } = useProgramTemplates({ search, status, page, size: 12 })
  const duplicate = useDuplicateProgramTemplate()

  function updateParam(key: string, value: string | undefined) {
    const params = new URLSearchParams(searchParams.toString())
    if (value) {
      params.set(key, value)
    } else {
      params.delete(key)
    }
    if (key !== "page") params.delete("page")
    router.replace(`/training-templates?${params.toString()}`)
  }

  const hasFilters = !!(search || status)

  return (
    <div className="space-y-6">
      <PageHeader
        title="Programas de Treino"
        description="Crie e gerencie templates reutilizáveis de programas de treino"
        actions={
          <Button onClick={() => setCreateOpen(true)} data-testid="create-template-button">
            <Plus className="mr-2 size-4" />
            Criar programa
          </Button>
        }
      />

      <TemplateFilters
        search={search}
        onSearchChange={(val) => updateParam("search", val || undefined)}
        status={status}
        onStatusChange={(val) => updateParam("status", val)}
      />

      <TemplateGrid
        templates={data?.content ?? []}
        isLoading={isLoading}
        hasFilters={hasFilters}
        onEdit={(t) => setEditTemplate(t)}
        onDelete={(t) => setDeleteTemplate(t)}
        onDuplicate={(t) => duplicate.mutate(t.id)}
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

      <ProgramTemplateFormDialog open={createOpen} onOpenChange={setCreateOpen} />

      {editTemplate && (
        <ProgramTemplateFormDialog
          open={!!editTemplate}
          onOpenChange={(open) => !open && setEditTemplate(null)}
          template={editTemplate}
        />
      )}

      <DeleteProgramTemplateDialog
        template={deleteTemplate}
        open={!!deleteTemplate}
        onOpenChange={(open) => !open && setDeleteTemplate(null)}
      />
    </div>
  )
}

export default function TrainingTemplatesPage() {
  return (
    <Suspense fallback={<LoadingState variant="page" />}>
      <TrainingTemplatesContent />
    </Suspense>
  )
}
