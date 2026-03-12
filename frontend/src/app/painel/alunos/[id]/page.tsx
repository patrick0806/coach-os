"use client";

import { use, useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getStudent } from "@/services/students.service";
import { DeactivateStudentDialog } from "./_components/deactivate-student-dialog";
import { StudentBookingsSection } from "./_components/student-bookings-section";
import { StudentEditForm } from "./_components/student-edit-form";
import { StudentNotesTimeline } from "./_components/student-notes-timeline";
import { StudentWorkoutPlans } from "./_components/student-workout-plans";
import { StudentSchedulePlanner } from "./_components/student-schedule-planner";

interface AlunoDetailPageProps {
  params: Promise<{ id: string }>;
}

export default function AlunoDetailPage({ params }: AlunoDetailPageProps) {
  const { id } = use(params);
  const router = useRouter();
  const [deactivateOpen, setDeactivateOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"resumo" | "planejador" | "agendamentos" | "notas">("resumo");

  const { data: student, isLoading } = useQuery({
    queryKey: ["students", id],
    queryFn: () => getStudent(id),
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-12">
        <p className="text-muted-foreground">Carregando...</p>
      </div>
    );
  }

  if (!student) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 p-12">
        <p className="text-muted-foreground">Aluno não encontrado.</p>
        <Button variant="outline" onClick={() => router.push("/painel/alunos")}>
          Voltar para alunos
        </Button>
      </div>
    );
  }

  return (
    <>
      <div className="mx-auto max-w-3xl p-4 sm:p-8">
        <div className="mb-6">
          <Button
            variant="ghost"
            size="sm"
            className="-ml-2 mb-4 gap-1.5 text-gray-500"
            onClick={() => router.push("/painel/alunos")}
          >
            <ArrowLeft className="size-4" />
            Alunos
          </Button>

          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">{student.name}</h1>
              <p className="mt-1 text-sm text-gray-500">{student.email}</p>
            </div>
            <div className="flex items-center gap-3">
              <Badge variant={student.isActive ? "default" : "secondary"}>
                {student.isActive ? "Ativo" : "Inativo"}
              </Badge>
              {student.isActive ? (
                <Button
                  variant="outline"
                  size="sm"
                  className="text-destructive hover:text-destructive"
                  onClick={() => setDeactivateOpen(true)}
                >
                  Desativar aluno
                </Button>
              ) : null}
            </div>
          </div>
        </div>

        <div className="mb-6 flex flex-wrap gap-2 rounded-xl border bg-card p-1">
          <Button
            type="button"
            variant={activeTab === "resumo" ? "default" : "ghost"}
            size="sm"
            onClick={() => setActiveTab("resumo")}
          >
            Resumo
          </Button>
          <Button
            type="button"
            variant={activeTab === "planejador" ? "default" : "ghost"}
            size="sm"
            onClick={() => setActiveTab("planejador")}
          >
            Planejador
          </Button>
          <Button
            type="button"
            variant={activeTab === "agendamentos" ? "default" : "ghost"}
            size="sm"
            onClick={() => setActiveTab("agendamentos")}
          >
            Agendamentos
          </Button>
          <Button
            type="button"
            variant={activeTab === "notas" ? "default" : "ghost"}
            size="sm"
            onClick={() => setActiveTab("notas")}
          >
            Notas
          </Button>
        </div>

        {activeTab === "resumo" ? (
          <div className="space-y-6">
            <StudentEditForm student={student} />

            <StudentWorkoutPlans studentId={id} />
          </div>
        ) : activeTab === "planejador" ? (
          <StudentSchedulePlanner studentId={id} />
        ) : activeTab === "agendamentos" ? (
          <StudentBookingsSection studentId={id} />
        ) : (
          <StudentNotesTimeline studentId={id} />
        )}
      </div>

      <DeactivateStudentDialog
        studentId={id}
        studentName={student.name}
        open={deactivateOpen}
        onOpenChange={setDeactivateOpen}
        onSuccess={() => router.push("/painel/alunos")}
      />
    </>
  );
}
