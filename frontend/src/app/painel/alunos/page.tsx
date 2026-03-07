"use client";

import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Plus, Search } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { listStudents, type Student } from "@/services/students.service";
import { CreateStudentDialog } from "./_components/create-student-dialog";
import { DeactivateStudentDialog } from "./_components/deactivate-student-dialog";
import { EditStudentDialog } from "./_components/edit-student-dialog";
import { StudentsTable } from "./_components/students-table";

const PAGE_SIZE = 10;

export default function AlunosPage() {
  const [searchInput, setSearchInput] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [page, setPage] = useState(1);
  const [createOpen, setCreateOpen] = useState(false);
  const [editStudent, setEditStudent] = useState<Student | null>(null);
  const [deactivateStudent, setDeactivateStudent] = useState<Student | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchInput);
      setPage(1);
    }, 400);
    return () => clearTimeout(timer);
  }, [searchInput]);

  const { data, isLoading } = useQuery({
    queryKey: ["students", { page, search: debouncedSearch }],
    queryFn: () =>
      listStudents({ page, size: PAGE_SIZE, search: debouncedSearch || undefined }),
  });

  const students = data?.content ?? [];
  const totalPages = data?.totalPages ?? 1;

  return (
    <div className="mx-auto max-w-5xl p-4 sm:p-8">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Alunos</h1>
          <p className="mt-1 text-sm text-gray-500">
            Gerencie seus alunos e acompanhe seu progresso.
          </p>
        </div>
        <Button onClick={() => setCreateOpen(true)} className="gap-2">
          <Plus className="size-4" />
          Novo aluno
        </Button>
      </div>

      <div className="mb-4 flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-gray-400" />
          <Input
            placeholder="Buscar por nome ou e-mail..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      <StudentsTable
        students={students}
        isLoading={isLoading}
        debouncedSearch={debouncedSearch}
        onEdit={setEditStudent}
        onDeactivate={setDeactivateStudent}
      />

      {totalPages > 1 ? (
        <div className="mt-4 flex items-center justify-between text-sm text-gray-500">
          <span>
            Página {page} de {totalPages} — {data?.totalElements ?? 0} alunos
          </span>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={page <= 1}
              onClick={() => setPage((p) => p - 1)}
            >
              Anterior
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= totalPages}
              onClick={() => setPage((p) => p + 1)}
            >
              Próxima
            </Button>
          </div>
        </div>
      ) : null}

      <CreateStudentDialog open={createOpen} onOpenChange={setCreateOpen} />
      <EditStudentDialog
        student={editStudent}
        onOpenChange={(open) => !open && setEditStudent(null)}
      />
      <DeactivateStudentDialog
        student={deactivateStudent}
        onOpenChange={(open) => !open && setDeactivateStudent(null)}
      />
    </div>
  );
}
