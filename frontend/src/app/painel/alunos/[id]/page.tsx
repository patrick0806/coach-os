"use client";

import { use, useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, CalendarDays } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getStudent } from "@/services/students.service";
import { DeactivateStudentDialog } from "./_components/deactivate-student-dialog";
import { StudentEditForm } from "./_components/student-edit-form";
import { StudentWorkoutPlans } from "./_components/student-workout-plans";

interface AlunoDetailPageProps {
  params: Promise<{ id: string }>;
}

export default function AlunoDetailPage({ params }: AlunoDetailPageProps) {
  const { id } = use(params);
  const router = useRouter();
  const [deactivateOpen, setDeactivateOpen] = useState(false);

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

        <div className="space-y-6">
          <StudentEditForm student={student} />

          <StudentWorkoutPlans studentId={id} />

          {/* Schedule — placeholder (US-014) */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <CalendarDays className="size-4 text-gray-400" />
                Próximos agendamentos
              </CardTitle>
            </CardHeader>
            <CardContent className="pb-6">
              <p className="text-sm text-muted-foreground">
                Os agendamentos deste aluno aparecerão aqui.
              </p>
            </CardContent>
          </Card>
        </div>
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
