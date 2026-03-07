"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

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
import { getApiErrorMessage } from "@/lib/api-error";
import { deactivateStudent, type Student } from "@/services/students.service";

interface DeactivateStudentDialogProps {
  student: Student | null;
  onOpenChange: (open: boolean) => void;
}

export function DeactivateStudentDialog({
  student,
  onOpenChange,
}: DeactivateStudentDialogProps) {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (id: string) => deactivateStudent(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["students"] });
      toast.success("Aluno desativado.");
      onOpenChange(false);
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, "Não foi possível desativar o aluno."));
    },
  });

  return (
    <AlertDialog open={Boolean(student)} onOpenChange={(open) => !open && onOpenChange(false)}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Desativar aluno</AlertDialogTitle>
          <AlertDialogDescription>
            Tem certeza que deseja desativar <strong>{student?.name}</strong>? O aluno perderá o
            acesso à plataforma, mas seus dados serão mantidos.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancelar</AlertDialogCancel>
          <AlertDialogAction
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            onClick={() => student && mutation.mutate(student.id)}
            disabled={mutation.isPending}
          >
            {mutation.isPending ? "Desativando..." : "Desativar"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
