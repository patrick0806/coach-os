"use client";

import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Plus, Search, Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { listStudents, type Student } from "@/services/students.service";
import { CreateStudentDialog } from "./_components/create-student-dialog";
import { DeactivateStudentDialog } from "./_components/deactivate-student-dialog";
import { EditStudentDialog } from "./_components/edit-student-dialog";
import { StudentsTable } from "./_components/students-table";

const PAGE_SIZE = 10;

export default function AlunosPage() {
  const shouldStartCreateOpen =
    typeof window !== "undefined" &&
    new URLSearchParams(window.location.search).get("action") === "new-student";
  const [searchInput, setSearchInput] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [page, setPage] = useState(1);
  const [createOpen, setCreateOpen] = useState(shouldStartCreateOpen);
  const [editStudent, setEditStudent] = useState<Student | null>(null);
  const [deactivateStudent, setDeactivateStudent] = useState<Student | null>(null);
  const [quickFilter, setQuickFilter] = useState<"all" | "active" | "inactive" | "without-plan">("all");

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

  const students = (data?.content ?? []).filter((student) => {
    if (quickFilter === "active") return student.isActive;
    if (quickFilter === "inactive") return !student.isActive;
    if (quickFilter === "without-plan") return !student.servicePlanName;
    return true;
  });
  const totalPages = data?.totalPages ?? 1;

  return (
    <div className="mx-auto max-w-5xl p-4 sm:p-8">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <span className="mb-2 inline-flex items-center gap-2 rounded-full border border-[color:var(--premium-border)] bg-background/50 px-3 py-1 text-xs font-medium text-muted-foreground">
            <Sparkles className="size-3.5 text-primary" />
            Operação de alunos
          </span>
          <h1 className="premium-heading text-3xl">Alunos</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Gerencie seus alunos e acompanhe seu progresso.
          </p>
        </div>
        <Button onClick={() => setCreateOpen(true)} variant="premium" className="gap-2">
          <Plus className="size-4" />
          Novo aluno
        </Button>
      </div>

      <div className="mb-4 flex flex-col gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar por nome ou e-mail..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="h-11 rounded-2xl border-[color:var(--premium-border)] bg-background/40 pl-9"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          {[
            { value: "all", label: "Todos" },
            { value: "active", label: "Ativos" },
            { value: "inactive", label: "Inativos" },
            { value: "without-plan", label: "Sem plano" },
          ].map((filter) => (
            <button
              key={filter.value}
              type="button"
              onClick={() => setQuickFilter(filter.value as typeof quickFilter)}
              className={
                quickFilter === filter.value
                  ? "premium-highlight rounded-full px-4 py-2 text-xs font-medium text-primary-foreground shadow-[var(--premium-shadow)]"
                  : "premium-glass rounded-full px-4 py-2 text-xs font-medium text-muted-foreground"
              }
            >
              {filter.label}
            </button>
          ))}
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
        <div className="mt-4 flex items-center justify-between text-sm text-muted-foreground">
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
