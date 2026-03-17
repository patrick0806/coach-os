"use client"

import { Suspense, useState } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { UserPlus, Users } from "lucide-react"

import { Button } from "@/shared/ui/button"
import { EmptyState } from "@/shared/components/emptyState"
import { LoadingState } from "@/shared/components/loadingState"
import { PageHeader } from "@/shared/components/pageHeader"
import { StudentFilters } from "@/features/students/components/studentFilters"
import { StudentFormDialog } from "@/features/students/components/studentFormDialog"
import { StudentTable } from "@/features/students/components/studentTable"
import { InviteStudentDialog } from "@/features/students/components/inviteStudentDialog"
import { useStudents } from "@/features/students/hooks/useStudents"
import type { StudentItem, StudentStatus } from "@/features/students/types/students.types"

function StudentsContent() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [createOpen, setCreateOpen] = useState(false)
  const [inviteOpen, setInviteOpen] = useState(false)
  const [editStudent, setEditStudent] = useState<StudentItem | null>(null)

  const search = searchParams.get("search") ?? ""
  const status = (searchParams.get("status") as StudentStatus) || undefined
  const page = Number(searchParams.get("page") ?? "0")

  const { data, isLoading } = useStudents({ search, status, page, size: 20 })

  function updateParam(key: string, value: string | undefined) {
    const params = new URLSearchParams(searchParams.toString())
    if (value) {
      params.set(key, value)
    } else {
      params.delete(key)
    }
    if (key !== "page") params.delete("page")
    router.replace(`/students?${params.toString()}`)
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Alunos"
        description="Gerencie seus alunos"
        actions={
          <>
            <Button variant="outline" onClick={() => setInviteOpen(true)}>
              Convidar
            </Button>
            <Button onClick={() => setCreateOpen(true)}>
              <UserPlus className="mr-2 size-4" />
              Novo aluno
            </Button>
          </>
        }
      />

      <StudentFilters
        search={search}
        onSearchChange={(val) => updateParam("search", val || undefined)}
        status={status}
        onStatusChange={(val) => updateParam("status", val)}
      />

      {isLoading ? (
        <LoadingState variant="table" />
      ) : !data?.content?.length ? (
        <EmptyState
          icon={Users}
          title="Nenhum aluno encontrado"
          description={
            search || status
              ? "Tente ajustar os filtros de busca."
              : "Comece adicionando seu primeiro aluno."
          }
          action={
            !search && !status ? (
              <Button onClick={() => setCreateOpen(true)}>
                <UserPlus className="mr-2 size-4" />
                Novo aluno
              </Button>
            ) : undefined
          }
        />
      ) : (
        <>
          <StudentTable
            students={data.content}
            onEdit={(s) => setEditStudent(s)}
          />
          {data.totalPages > 1 && (
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
        </>
      )}

      <StudentFormDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
      />

      {editStudent && (
        <StudentFormDialog
          open={!!editStudent}
          onOpenChange={(open) => !open && setEditStudent(null)}
          student={editStudent}
        />
      )}

      <InviteStudentDialog open={inviteOpen} onOpenChange={setInviteOpen} />
    </div>
  )
}

export default function StudentsPage() {
  return (
    <Suspense fallback={<LoadingState variant="page" />}>
      <StudentsContent />
    </Suspense>
  )
}
