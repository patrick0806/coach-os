"use client"

import { useState } from "react"
import { Plus, ClipboardList } from "lucide-react"

import { Button } from "@/shared/ui/button"
import { EmptyState } from "@/shared/components/emptyState"
import { LoadingState } from "@/shared/components/loadingState"
import { Tabs, TabsList, TabsTrigger } from "@/shared/ui/tabs"
import { StudentProgramCard } from "@/features/studentPrograms/components/studentProgramCard"
import { AssignProgramDialog } from "@/features/studentPrograms/components/assignProgramDialog"
import { useStudentPrograms } from "@/features/studentPrograms/hooks/useStudentPrograms"
import type { StudentProgramStatus } from "@/features/studentPrograms/types/studentPrograms.types"

interface StudentProgramsSectionProps {
  studentId: string
}

type FilterTab = "all" | StudentProgramStatus

export function StudentProgramsSection({ studentId }: StudentProgramsSectionProps) {
  const [assignOpen, setAssignOpen] = useState(false)
  const [filter, setFilter] = useState<FilterTab>("active")

  const params = filter !== "all" ? { status: filter as StudentProgramStatus } : undefined
  const { data, isLoading } = useStudentPrograms(studentId, params)

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <Tabs value={filter} onValueChange={(v) => setFilter(v as FilterTab)}>
          <TabsList variant="line">
            <TabsTrigger value="all">Todos</TabsTrigger>
            <TabsTrigger value="active">Ativos</TabsTrigger>
            <TabsTrigger value="finished">Finalizados</TabsTrigger>
            <TabsTrigger value="cancelled">Cancelados</TabsTrigger>
          </TabsList>
        </Tabs>

        <Button
          size="sm"
          onClick={() => setAssignOpen(true)}
          data-testid="assign-program-button"
        >
          <Plus className="mr-2 size-3.5" />
          Adicionar programa
        </Button>
      </div>

      {isLoading ? (
        <LoadingState variant="list" />
      ) : !data?.content.length ? (
        <EmptyState
          icon={ClipboardList}
          title="Nenhum programa"
          description={
            filter === "all"
              ? "Atribua um programa de treino para este aluno."
              : "Nenhum programa com este status."
          }
          className="py-8"
        />
      ) : (
        <div className="space-y-2">
          {data.content.map((program) => (
            <StudentProgramCard
              key={program.id}
              program={program}
              studentId={studentId}
            />
          ))}
        </div>
      )}

      <AssignProgramDialog
        open={assignOpen}
        onOpenChange={setAssignOpen}
        studentId={studentId}
      />
    </div>
  )
}
