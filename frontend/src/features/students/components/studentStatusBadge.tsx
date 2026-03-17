import { Badge } from "@/shared/ui/badge"
import type { StudentStatus } from "@/features/students/types/students.types"

const config: Record<StudentStatus, { label: string; className: string }> = {
  active: {
    label: "Ativo",
    className: "bg-success/15 text-success border-success/20",
  },
  paused: {
    label: "Pausado",
    className: "bg-warning/15 text-warning border-warning/20",
  },
  archived: {
    label: "Arquivado",
    className: "bg-muted text-muted-foreground border-border",
  },
}

interface StudentStatusBadgeProps {
  status: StudentStatus
}

export function StudentStatusBadge({ status }: StudentStatusBadgeProps) {
  const { label, className } = config[status]
  return (
    <Badge variant="outline" className={className}>
      {label}
    </Badge>
  )
}
