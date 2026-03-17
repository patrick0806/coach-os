import Link from "next/link"
import { ChevronLeft } from "lucide-react"

import { StudentDetail } from "@/features/students/components/studentDetail"

interface StudentDetailPageProps {
  params: Promise<{ id: string }>
}

export default async function StudentDetailPage({ params }: StudentDetailPageProps) {
  const { id } = await params

  return (
    <div className="space-y-6">
      <Link
        href="/students"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ChevronLeft className="size-4" />
        Voltar para alunos
      </Link>

      <StudentDetail studentId={id} />
    </div>
  )
}
