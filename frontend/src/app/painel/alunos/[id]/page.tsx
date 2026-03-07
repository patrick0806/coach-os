"use client";

import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { ArrowLeft, CalendarDays, Dumbbell } from "lucide-react";

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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { getApiErrorMessage } from "@/lib/api-error";
import { deactivateStudent, getStudent, updateStudent } from "@/services/students.service";

const editSchema = z.object({
  name: z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
  email: z.string().email("Informe um e-mail válido"),
});

type EditFormValues = z.infer<typeof editSchema>;

interface AlunoDetailPageProps {
  params: Promise<{ id: string }>;
}

export default function AlunoDetailPage({ params }: AlunoDetailPageProps) {
  const { id } = use(params);
  const router = useRouter();
  const queryClient = useQueryClient();
  const [deactivateOpen, setDeactivateOpen] = useState(false);

  const { data: student, isLoading } = useQuery({
    queryKey: ["students", id],
    queryFn: () => getStudent(id),
  });

  const form = useForm<EditFormValues>({
    resolver: zodResolver(editSchema),
    defaultValues: { name: "", email: "" },
  });

  useEffect(() => {
    if (student) {
      form.reset({ name: student.name, email: student.email });
    }
  }, [student, form]);

  const updateMutation = useMutation({
    mutationFn: (values: EditFormValues) => updateStudent(id, values),
    onSuccess: (data) => {
      queryClient.setQueryData(["students", id], data);
      queryClient.invalidateQueries({ queryKey: ["students"] });
      toast.success("Dados atualizados com sucesso.");
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, "Não foi possível atualizar o aluno."));
    },
  });

  const deactivateMutation = useMutation({
    mutationFn: () => deactivateStudent(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["students"] });
      toast.success("Aluno desativado.");
      router.push("/painel/alunos");
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, "Não foi possível desativar o aluno."));
      setDeactivateOpen(false);
    },
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
        {/* Header */}
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
          {/* Edit form */}
          <Card>
            <CardHeader>
              <CardTitle>Dados do aluno</CardTitle>
            </CardHeader>
            <CardContent>
              <form
                onSubmit={form.handleSubmit((values) => updateMutation.mutate(values))}
                className="space-y-4"
                noValidate
              >
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="name">Nome</Label>
                    <Input id="name" {...form.register("name")} />
                    {form.formState.errors.name ? (
                      <p className="text-sm text-destructive">
                        {form.formState.errors.name.message}
                      </p>
                    ) : null}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">E-mail</Label>
                    <Input id="email" type="email" {...form.register("email")} />
                    {form.formState.errors.email ? (
                      <p className="text-sm text-destructive">
                        {form.formState.errors.email.message}
                      </p>
                    ) : null}
                  </div>
                </div>

                <Separator />

                <div className="grid gap-4 text-sm text-gray-500 sm:grid-cols-2">
                  <div>
                    <span className="block font-medium text-gray-700">Cadastrado em</span>
                    {new Date(student.createdAt).toLocaleDateString("pt-BR", {
                      day: "2-digit",
                      month: "long",
                      year: "numeric",
                    })}
                  </div>
                  <div>
                    <span className="block font-medium text-gray-700">Última atualização</span>
                    {new Date(student.updatedAt).toLocaleDateString("pt-BR", {
                      day: "2-digit",
                      month: "long",
                      year: "numeric",
                    })}
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button type="submit" disabled={updateMutation.isPending}>
                    {updateMutation.isPending ? "Salvando..." : "Salvar alterações"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          {/* Workouts — placeholder (US-009) */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Dumbbell className="size-4 text-gray-400" />
                Treinos atribuídos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Os treinos atribuídos a este aluno aparecerão aqui.
              </p>
            </CardContent>
          </Card>

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

      {/* Deactivate confirmation */}
      <AlertDialog open={deactivateOpen} onOpenChange={setDeactivateOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Desativar aluno</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja desativar <strong>{student.name}</strong>? O aluno perderá o
              acesso à plataforma, mas seus dados serão mantidos.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deactivateMutation.isPending}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => deactivateMutation.mutate()}
              disabled={deactivateMutation.isPending}
            >
              {deactivateMutation.isPending ? "Desativando..." : "Desativar"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
