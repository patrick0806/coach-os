"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { MoreHorizontal, ChevronRight } from "lucide-react"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"

import { Card, CardContent } from "@/shared/ui/card"
import { Button } from "@/shared/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/shared/ui/dropdown-menu"
import { StudentProgramStatusBadge } from "@/features/studentPrograms/components/studentProgramStatusBadge"
import { UpdateProgramStatusDialog } from "@/features/studentPrograms/components/updateProgramStatusDialog"
import type { StudentProgramItem } from "@/features/studentPrograms/types/studentPrograms.types"

interface StudentProgramCardProps {
  program: StudentProgramItem
  studentId: string
}

export function StudentProgramCard({ program, studentId }: StudentProgramCardProps) {
  const router = useRouter()
  const [statusDialogOpen, setStatusDialogOpen] = useState(false)

  function handleView() {
    router.push(`/students/${studentId}/programs/${program.id}`)
  }

  return (
    <>
      <Card
        className="cursor-pointer transition-colors hover:border-primary/50"
        onClick={handleView}
        data-testid="student-program-card"
      >
        <CardContent className="flex items-center gap-3 p-4">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <p className="font-medium text-sm truncate">{program.name}</p>
              <StudentProgramStatusBadge status={program.status} />
            </div>
            {program.startedAt && (
              <p className="text-xs text-muted-foreground mt-0.5">
                Iniciado em{" "}
                {format(new Date(program.startedAt), "d 'de' MMMM 'de' yyyy", { locale: ptBR })}
              </p>
            )}
          </div>

          <div className="flex shrink-0 items-center gap-1">
            <DropdownMenu>
              <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                <Button variant="ghost" size="icon" className="size-7">
                  <MoreHorizontal className="size-4" />
                  <span className="sr-only">Ações</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleView() }}>
                  Ver programa
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={(e) => { e.stopPropagation(); setStatusDialogOpen(true) }}
                  data-testid="change-status-menu-item"
                >
                  Alterar status
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <ChevronRight className="size-4 text-muted-foreground" />
          </div>
        </CardContent>
      </Card>

      <UpdateProgramStatusDialog
        open={statusDialogOpen}
        onOpenChange={setStatusDialogOpen}
        program={program}
        studentId={studentId}
      />
    </>
  )
}
