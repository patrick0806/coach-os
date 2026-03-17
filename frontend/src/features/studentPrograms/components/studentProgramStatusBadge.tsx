"use client"

import { Badge } from "@/shared/ui/badge"
import type { StudentProgramStatus } from "@/features/studentPrograms/types/studentPrograms.types"

interface StudentProgramStatusBadgeProps {
  status: StudentProgramStatus
}

const statusConfig: Record<StudentProgramStatus, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  active: { label: "Ativo", variant: "default" },
  finished: { label: "Finalizado", variant: "secondary" },
  cancelled: { label: "Cancelado", variant: "destructive" },
}

export function StudentProgramStatusBadge({ status }: StudentProgramStatusBadgeProps) {
  const config = statusConfig[status]
  return <Badge variant={config.variant}>{config.label}</Badge>
}
