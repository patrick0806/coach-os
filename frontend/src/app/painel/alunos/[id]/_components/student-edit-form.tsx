"use client";

import { useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useForm, useWatch } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { getApiErrorMessage } from "@/lib/api-error";
import { StudentDetail, updateStudent } from "@/services/students.service";
import { listServicePlans } from "@/services/service-plans.service";

const editSchema = z.object({
  name: z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
  email: z.email("Informe um e-mail válido"),
  servicePlanId: z.string().uuid("Selecione um plano de atendimento"),
});

type EditFormValues = z.infer<typeof editSchema>;

interface StudentEditFormProps {
  student: StudentDetail;
}

export function StudentEditForm({ student }: StudentEditFormProps) {
  const queryClient = useQueryClient();
  const servicePlansQuery = useQuery({
    queryKey: ["service-plans", "student-edit-form"],
    queryFn: listServicePlans,
    select: (plans) => plans.filter((plan) => plan.isActive),
  });

  const form = useForm<EditFormValues>({
    resolver: zodResolver(editSchema),
    defaultValues: {
      name: student.name,
      email: student.email,
      servicePlanId: student.servicePlanId,
    },
  });
  const servicePlanId = useWatch({ control: form.control, name: "servicePlanId" }) ?? "";

  useEffect(() => {
    form.reset({
      name: student.name,
      email: student.email,
      servicePlanId: student.servicePlanId,
    });
  }, [student, form]);

  const mutation = useMutation({
    mutationFn: (values: EditFormValues) => updateStudent(student.id, values),
    onSuccess: (data) => {
      queryClient.setQueryData(["students", student.id], data);
      queryClient.invalidateQueries({ queryKey: ["students"] });
      toast.success("Dados atualizados com sucesso.");
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, "Não foi possível atualizar o aluno."));
    },
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Dados do aluno</CardTitle>
      </CardHeader>
      <CardContent>
        <form
          onSubmit={form.handleSubmit((values) => mutation.mutate(values))}
          className="space-y-4"
          noValidate
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="name">Nome</Label>
              <Input id="name" {...form.register("name")} />
              {form.formState.errors.name ? (
                <p className="text-sm text-destructive">{form.formState.errors.name.message}</p>
              ) : null}
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">E-mail</Label>
              <Input id="email" type="email" {...form.register("email")} />
              {form.formState.errors.email ? (
                <p className="text-sm text-destructive">{form.formState.errors.email.message}</p>
              ) : null}
            </div>
          </div>

          <div className="space-y-2">
            <Label>Plano de atendimento</Label>
            <Select
              value={servicePlanId}
              onValueChange={(value) =>
                form.setValue("servicePlanId", value, { shouldValidate: true, shouldDirty: true })
              }
            >
              <SelectTrigger>
                <SelectValue
                  placeholder={
                    servicePlansQuery.isLoading ? "Carregando planos..." : "Selecione um plano"
                  }
                />
              </SelectTrigger>
              <SelectContent>
                {(servicePlansQuery.data ?? []).map((plan) => (
                  <SelectItem key={plan.id} value={plan.id}>
                    {plan.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {form.formState.errors.servicePlanId ? (
              <p className="text-sm text-destructive">
                {form.formState.errors.servicePlanId.message}
              </p>
            ) : null}
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
            <Button type="submit" disabled={mutation.isPending}>
              {mutation.isPending ? "Salvando..." : "Salvar alterações"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
