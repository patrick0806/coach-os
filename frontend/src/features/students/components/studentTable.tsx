"use client"

import { MoreHorizontal } from "lucide-react"
import { motion } from "framer-motion"
import { useRouter } from "next/navigation"

import { Avatar, AvatarFallback } from "@/shared/ui/avatar"
import { Button } from "@/shared/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/shared/ui/dropdown-menu"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/ui/table"
import { StudentStatusBadge } from "@/features/students/components/studentStatusBadge"
import { useUpdateStudentStatus } from "@/features/students/hooks/useUpdateStudentStatus"
import type { StudentItem, StudentStatus } from "@/features/students/types/students.types"
import { fadeIn } from "@/lib/animations"
import { formatShortDate } from "@/shared/utils/formatDate"

interface StudentTableProps {
  students: StudentItem[]
  onEdit: (student: StudentItem) => void
  onInvite: (student: StudentItem) => void
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

interface RowActionsProps {
  student: StudentItem
  onEdit: (student: StudentItem) => void
  onInvite: (student: StudentItem) => void
}

function RowActions({ student, onEdit, onInvite }: RowActionsProps) {
  const router = useRouter()
  const updateStatus = useUpdateStudentStatus(student.id)
  const actions = statusActions[student.status]

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="size-8" data-tour="student-row-actions">
          <MoreHorizontal className="size-4" />
          <span className="sr-only">Ações</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => router.push(`/students/${student.id}`)}>
          Ver detalhes
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => onEdit(student)}>Editar</DropdownMenuItem>
        <DropdownMenuItem onClick={() => onInvite(student)}>Enviar convite</DropdownMenuItem>
        <DropdownMenuSeparator />
        {actions.map((action) => (
          <DropdownMenuItem
            key={action.next}
            onClick={() => updateStatus.mutate(action.next)}
          >
            {action.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

function StudentCard({ student, onEdit, onInvite }: { student: StudentItem; onEdit: (s: StudentItem) => void; onInvite: (s: StudentItem) => void }) {
  const router = useRouter()

  return (
    <div
      data-testid="student-card"
      className="flex items-center gap-3 rounded-lg border bg-card p-4 cursor-pointer hover:border-primary/50 transition-colors"
      onClick={() => router.push(`/students/${student.id}`)}
    >
      <Avatar className="size-10 shrink-0">
        <AvatarFallback className="text-sm">{getInitials(student.name)}</AvatarFallback>
      </Avatar>
      <div className="min-w-0 flex-1">
        <p className="font-medium truncate">{student.name}</p>
        <p className="text-sm text-muted-foreground truncate">{student.email}</p>
        <div className="mt-1">
          <StudentStatusBadge status={student.status} />
        </div>
      </div>
      <div onClick={(e) => e.stopPropagation()}>
        <RowActions student={student} onEdit={onEdit} onInvite={onInvite} />
      </div>
    </div>
  )
}

export function StudentTable({ students, onEdit, onInvite }: StudentTableProps) {
  return (
    <motion.div variants={fadeIn} initial="hidden" animate="visible">
      {/* Mobile: vertical cards */}
      <div className="sm:hidden space-y-2">
        {students.map((student) => (
          <StudentCard key={student.id} student={student} onEdit={onEdit} onInvite={onInvite} />
        ))}
      </div>

      {/* Desktop: table */}
      <div className="hidden sm:block">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Aluno</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="hidden sm:table-cell">Cadastrado em</TableHead>
              <TableHead className="w-10" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {students.map((student) => (
              <TableRow key={student.id}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Avatar className="size-9">
                      <AvatarFallback className="text-xs">
                        {getInitials(student.name)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{student.name}</p>
                      <p className="text-sm text-muted-foreground">{student.email}</p>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <StudentStatusBadge status={student.status} />
                </TableCell>
                <TableCell className="hidden sm:table-cell text-sm text-muted-foreground">
                  {student.createdAt
                    ? formatShortDate(student.createdAt)
                    : "—"}
                </TableCell>
                <TableCell>
                  <RowActions student={student} onEdit={onEdit} onInvite={onInvite} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </motion.div>
  )
}
