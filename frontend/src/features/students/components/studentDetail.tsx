"use client"

import { useState } from "react"
import { MoreHorizontal } from "lucide-react"

import { Avatar, AvatarFallback } from "@/shared/ui/avatar"
import { Button } from "@/shared/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/shared/ui/dropdown-menu"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/ui/tabs"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/shared/ui/tooltip"
import { LoadingState } from "@/shared/components/loadingState"
import { StudentStatusBadge } from "@/features/students/components/studentStatusBadge"
import { StudentFormDialog } from "@/features/students/components/studentFormDialog"
import { StudentNotes } from "@/features/students/components/studentNotes"
import { StudentProgramsSection } from "@/features/studentPrograms/components/studentProgramsSection"
import { StudentContractSection } from "@/features/coachingContracts/components/studentContractSection"
import { useStudent } from "@/features/students/hooks/useStudent"
import { useUpdateStudentStatus } from "@/features/students/hooks/useUpdateStudentStatus"
import type { StudentStatus } from "@/features/students/types/students.types"

interface StudentDetailProps {
  studentId: string
}

function getInitials(name: string): string {
  return name
    .split(" ")
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase()
}

const statusActions: Record<StudentStatus, { label: string; next: StudentStatus }[]> = {
  active: [
    { label: "Pausar", next: "paused" },
    { label: "Arquivar", next: "archived" },
  ],
  paused: [
    { label: "Ativar", next: "active" },
    { label: "Arquivar", next: "archived" },
  ],
  archived: [{ label: "Ativar", next: "active" }],
}

export function StudentDetail({ studentId }: StudentDetailProps) {
  const [editOpen, setEditOpen] = useState(false)
  const { data: student, isLoading } = useStudent(studentId)
  const updateStatus = useUpdateStudentStatus(studentId)

  if (isLoading) {
    return <LoadingState variant="card" />
  }

  if (!student) {
    return (
      <p className="text-sm text-muted-foreground">Aluno não encontrado.</p>
    )
  }

  const actions = statusActions[student.status]

  return (
    <div className="space-y-6">
      <div className="flex items-start gap-4">
        <Avatar className="size-16">
          <AvatarFallback className="text-xl">{getInitials(student.name)}</AvatarFallback>
        </Avatar>
        <div className="flex flex-1 flex-col gap-1">
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-semibold">{student.name}</h2>
            <StudentStatusBadge status={student.status} />
          </div>
          <p className="text-sm text-muted-foreground">{student.email}</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => setEditOpen(true)}>
            Editar
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="size-8">
                <MoreHorizontal className="size-4" />
                <span className="sr-only">Mais ações</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {actions.map((action, i) => (
                <div key={action.next}>
                  {i > 0 && <DropdownMenuSeparator />}
                  <DropdownMenuItem onClick={() => updateStatus.mutate(action.next)}>
                    {action.label}
                  </DropdownMenuItem>
                </div>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <Tabs defaultValue="info">
        <TabsList variant="line">
          <TabsTrigger value="info">Informações</TabsTrigger>
          <TabsTrigger value="notes">Notas</TabsTrigger>
          <TabsTrigger value="programs">Programas</TabsTrigger>
          <TabsTrigger value="service">Serviço</TabsTrigger>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <span className="pointer-events-none opacity-40">
                  <TabsTrigger value="agenda" disabled>
                    Agenda
                  </TabsTrigger>
                </span>
              </TooltipTrigger>
              <TooltipContent>Em breve</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </TabsList>

        <TabsContent value="info" className="mt-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <InfoField label="Telefone" value={student.phoneNumber} />
            <InfoField label="Objetivo" value={student.goal} />
            <InfoField label="Observações" value={student.observations} fullWidth />
            <InfoField
              label="Restrições físicas"
              value={student.physicalRestrictions}
              fullWidth
            />
          </div>
        </TabsContent>

        <TabsContent value="notes" className="mt-4">
          <StudentNotes studentId={studentId} />
        </TabsContent>

        <TabsContent value="programs" className="mt-4">
          <StudentProgramsSection studentId={studentId} />
        </TabsContent>

        <TabsContent value="service" className="mt-4">
          <StudentContractSection studentId={studentId} />
        </TabsContent>
      </Tabs>

      <StudentFormDialog open={editOpen} onOpenChange={setEditOpen} student={student} />
    </div>
  )
}

function InfoField({
  label,
  value,
  fullWidth,
}: {
  label: string
  value: string | null | undefined
  fullWidth?: boolean
}) {
  return (
    <div className={fullWidth ? "sm:col-span-2" : ""}>
      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">
        {label}
      </p>
      <p className="text-sm">{value || "—"}</p>
    </div>
  )
}
