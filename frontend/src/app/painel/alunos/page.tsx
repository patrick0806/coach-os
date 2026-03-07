"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { MoreHorizontal, Plus, Search, UserRound } from "lucide-react";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getApiErrorMessage } from "@/lib/api-error";
import {
  createStudent,
  deactivateStudent,
  listStudents,
  updateStudent,
  type Student,
} from "@/services/students.service";

// ─── Schemas ──────────────────────────────────────────────────────────────────

const studentFormSchema = z.object({
  name: z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
  email: z.string().email("Informe um e-mail válido"),
});

type StudentFormValues = z.infer<typeof studentFormSchema>;

// ─── Create dialog ────────────────────────────────────────────────────────────

interface CreateStudentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function CreateStudentDialog({ open, onOpenChange }: CreateStudentDialogProps) {
  const queryClient = useQueryClient();

  const form = useForm<StudentFormValues>({
    resolver: zodResolver(studentFormSchema),
    defaultValues: { name: "", email: "" },
  });

  const mutation = useMutation({
    mutationFn: createStudent,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["students"] });
      toast.success(`Convite enviado para ${data.email}. O aluno receberá um link para definir sua senha.`);
      onOpenChange(false);
      form.reset();
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, "Não foi possível cadastrar o aluno."));
    },
  });

  function handleOpenChange(value: boolean) {
    if (!value) form.reset();
    onOpenChange(value);
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Novo aluno</DialogTitle>
          <DialogDescription>
            O aluno receberá um e-mail com o link para definir sua senha de acesso.
          </DialogDescription>
        </DialogHeader>

        <form
          onSubmit={form.handleSubmit((values) => mutation.mutate(values))}
          className="space-y-4"
          noValidate
        >
          <div className="space-y-2">
            <Label htmlFor="create-name">Nome</Label>
            <Input id="create-name" placeholder="João Silva" {...form.register("name")} />
            {form.formState.errors.name ? (
              <p className="text-sm text-destructive">{form.formState.errors.name.message}</p>
            ) : null}
          </div>

          <div className="space-y-2">
            <Label htmlFor="create-email">E-mail</Label>
            <Input
              id="create-email"
              type="email"
              placeholder="joao@exemplo.com"
              {...form.register("email")}
            />
            {form.formState.errors.email ? (
              <p className="text-sm text-destructive">{form.formState.errors.email.message}</p>
            ) : null}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => handleOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={mutation.isPending}>
              {mutation.isPending ? "Cadastrando..." : "Cadastrar aluno"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// ─── Edit dialog ──────────────────────────────────────────────────────────────

interface EditStudentDialogProps {
  student: Student | null;
  onOpenChange: (open: boolean) => void;
}

function EditStudentDialog({ student, onOpenChange }: EditStudentDialogProps) {
  const queryClient = useQueryClient();

  const form = useForm<StudentFormValues>({
    resolver: zodResolver(studentFormSchema),
    defaultValues: { name: student?.name ?? "", email: student?.email ?? "" },
  });

  useEffect(() => {
    if (student) {
      form.reset({ name: student.name, email: student.email });
    }
  }, [student, form]);

  const mutation = useMutation({
    mutationFn: (values: StudentFormValues) => updateStudent(student!.id, values),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["students"] });
      toast.success("Dados do aluno atualizados.");
      onOpenChange(false);
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, "Não foi possível atualizar o aluno."));
    },
  });

  return (
    <Dialog open={Boolean(student)} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Editar aluno</DialogTitle>
        </DialogHeader>

        <form
          onSubmit={form.handleSubmit((values) => mutation.mutate(values))}
          className="space-y-4"
          noValidate
        >
          <div className="space-y-2">
            <Label htmlFor="edit-name">Nome</Label>
            <Input id="edit-name" placeholder="João Silva" {...form.register("name")} />
            {form.formState.errors.name ? (
              <p className="text-sm text-destructive">{form.formState.errors.name.message}</p>
            ) : null}
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-email">E-mail</Label>
            <Input
              id="edit-email"
              type="email"
              placeholder="joao@exemplo.com"
              {...form.register("email")}
            />
            {form.formState.errors.email ? (
              <p className="text-sm text-destructive">{form.formState.errors.email.message}</p>
            ) : null}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={mutation.isPending}>
              {mutation.isPending ? "Salvando..." : "Salvar"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

const PAGE_SIZE = 10;

export default function AlunosPage() {
  const router = useRouter();
  const queryClient = useQueryClient();

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

  const deactivateMutation = useMutation({
    mutationFn: (id: string) => deactivateStudent(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["students"] });
      toast.success("Aluno desativado.");
      setDeactivateStudent(null);
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, "Não foi possível desativar o aluno."));
    },
  });

  const students = data?.content ?? [];
  const totalPages = data?.totalPages ?? 1;

  return (
    <div className="mx-auto max-w-5xl p-4 sm:p-8">
      {/* Header */}
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

      {/* Search */}
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

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>E-mail</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Cadastrado em</TableHead>
                  <TableHead className="w-12" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <TableRow key={i}>
                      {Array.from({ length: 5 }).map((__, j) => (
                        <TableCell key={j}>
                          <div className="h-4 animate-pulse rounded bg-gray-100" />
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : students.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="py-16 text-center text-gray-400">
                      <UserRound className="mx-auto mb-3 size-10 opacity-30" />
                      {debouncedSearch
                        ? "Nenhum aluno encontrado para esta busca."
                        : "Você ainda não tem alunos cadastrados."}
                    </TableCell>
                  </TableRow>
                ) : (
                  students.map((student) => (
                    <TableRow key={student.id} className="group">
                      <TableCell className="font-medium">{student.name}</TableCell>
                      <TableCell className="text-gray-500">{student.email}</TableCell>
                      <TableCell>
                        <Badge variant={student.isActive ? "default" : "secondary"}>
                          {student.isActive ? "Ativo" : "Inativo"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-gray-500">
                        {new Date(student.createdAt).toLocaleDateString("pt-BR")}
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="size-8 p-0 opacity-0 group-hover:opacity-100"
                            >
                              <MoreHorizontal className="size-4" />
                              <span className="sr-only">Ações</span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() => router.push(`/painel/alunos/${student.id}`)}
                            >
                              Ver detalhes
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => setEditStudent(student)}>
                              Editar
                            </DropdownMenuItem>
                            {student.isActive ? (
                              <>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                  className="text-destructive focus:text-destructive"
                                  onClick={() => setDeactivateStudent(student)}
                                >
                                  Desativar
                                </DropdownMenuItem>
                              </>
                            ) : null}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Pagination */}
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

      {/* Dialogs */}
      <CreateStudentDialog open={createOpen} onOpenChange={setCreateOpen} />
      <EditStudentDialog student={editStudent} onOpenChange={(open) => !open && setEditStudent(null)} />

      <AlertDialog
        open={Boolean(deactivateStudent)}
        onOpenChange={(open) => !open && setDeactivateStudent(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Desativar aluno</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja desativar <strong>{deactivateStudent?.name}</strong>? O aluno
              perderá o acesso à plataforma, mas seus dados serão mantidos.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() =>
                deactivateStudent && deactivateMutation.mutate(deactivateStudent.id)
              }
            >
              Desativar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
