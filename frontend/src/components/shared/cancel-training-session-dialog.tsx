"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { AlertTriangle } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { getApiErrorMessage } from "@/lib/api-error";
import { cancelTrainingSession, type TrainingSession } from "@/services/training-schedule.service";

interface CancelTrainingSessionDialogProps {
  session: TrainingSession | null;
  /** When true, shows "Notificar Aluno" checkbox (personal trainer side) */
  showNotifyStudent?: boolean;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: (session: TrainingSession) => void;
}

export function CancelTrainingSessionDialog({
  session,
  showNotifyStudent = false,
  open,
  onOpenChange,
  onSuccess,
}: CancelTrainingSessionDialogProps) {
  const queryClient = useQueryClient();
  const [reason, setReason] = useState("");
  const [notifyStudent, setNotifyStudent] = useState(false);

  const mutation = useMutation({
    mutationFn: () =>
      cancelTrainingSession(session!.id, reason || undefined, notifyStudent),
    onSuccess: (updated) => {
      queryClient.invalidateQueries({ queryKey: ["training-sessions"] });
      toast.success("Sessão cancelada com sucesso.");
      setReason("");
      setNotifyStudent(false);
      onOpenChange(false);
      onSuccess?.(updated);
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, "Não foi possível cancelar a sessão."));
    },
  });

  function handleClose() {
    if (mutation.isPending) return;
    setReason("");
    setNotifyStudent(false);
    onOpenChange(false);
  }

  const formattedDate = session
    ? new Date(`${session.scheduledDate}T00:00:00`).toLocaleDateString("pt-BR", {
        weekday: "long",
        day: "2-digit",
        month: "long",
      })
    : "";

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="size-5 text-destructive" />
            Cancelar sessão de treino
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <p className="text-sm text-muted-foreground">
            Tem certeza que deseja cancelar a sessão de{" "}
            <span className="font-medium text-foreground">{formattedDate}</span>?
            Essa ação não afeta o padrão semanal recorrente.
          </p>

          <div className="space-y-1.5">
            <Label htmlFor="cancel-reason">Motivo (opcional)</Label>
            <Textarea
              id="cancel-reason"
              placeholder="Ex: Compromisso de última hora..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={3}
              maxLength={500}
              className="resize-none"
            />
          </div>

          {showNotifyStudent && (
            <div className="flex items-center gap-2.5 rounded-xl border bg-muted/40 px-3 py-3">
              <Checkbox
                id="notify-student"
                checked={notifyStudent}
                onCheckedChange={(checked) => setNotifyStudent(checked === true)}
              />
              <Label htmlFor="notify-student" className="cursor-pointer text-sm font-normal leading-snug">
                Notificar aluno por email sobre o cancelamento
              </Label>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={mutation.isPending}
          >
            Voltar
          </Button>
          <Button
            variant="destructive"
            onClick={() => mutation.mutate()}
            disabled={mutation.isPending || !session}
          >
            {mutation.isPending ? "Cancelando..." : "Confirmar cancelamento"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
