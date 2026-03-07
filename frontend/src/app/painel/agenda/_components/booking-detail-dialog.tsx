"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { CalendarDays, Clock, User } from "lucide-react";

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
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { getApiErrorMessage } from "@/lib/api-error";
import {
  BOOKING_STATUS_COLORS,
  BOOKING_STATUS_LABELS,
  cancelBooking,
  updateBookingStatus,
  type Booking,
} from "@/services/bookings.service";

interface BookingDetailDialogProps {
  booking: Booking | null;
  onOpenChange: (open: boolean) => void;
}

export function BookingDetailDialog({ booking, onOpenChange }: BookingDetailDialogProps) {
  const queryClient = useQueryClient();
  const [cancelOpen, setCancelOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState("");

  const statusMutation = useMutation({
    mutationFn: ({ status }: { status: "completed" | "no-show" }) =>
      updateBookingStatus(booking!.id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bookings"] });
      toast.success("Status atualizado.");
      onOpenChange(false);
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, "Não foi possível atualizar o status."));
    },
  });

  const cancelMutation = useMutation({
    mutationFn: () => cancelBooking(booking!.id, cancelReason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bookings"] });
      toast.success("Agendamento cancelado.");
      setCancelOpen(false);
      onOpenChange(false);
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, "Não foi possível cancelar o agendamento."));
    },
  });

  if (!booking) return null;

  const formattedDate = new Date(booking.scheduledDate + "T00:00:00").toLocaleDateString("pt-BR", {
    weekday: "long",
    day: "2-digit",
    month: "long",
    year: "numeric",
  });

  const canAct = booking.status === "scheduled";

  return (
    <>
      <Dialog open={Boolean(booking)} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Detalhes do agendamento</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div
              className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${BOOKING_STATUS_COLORS[booking.status]}`}
            >
              {BOOKING_STATUS_LABELS[booking.status]}
            </div>

            <div className="space-y-3 rounded-xl border bg-gray-50 p-4">
              <div className="flex items-start gap-3">
                <User className="mt-0.5 size-4 shrink-0 text-gray-400" />
                <div>
                  <p className="text-sm font-medium text-gray-900">{booking.studentName}</p>
                  <p className="text-xs text-gray-500">{booking.studentEmail}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <CalendarDays className="size-4 shrink-0 text-gray-400" />
                <p className="text-sm capitalize text-gray-700">{formattedDate}</p>
              </div>

              <div className="flex items-center gap-3">
                <Clock className="size-4 shrink-0 text-gray-400" />
                <p className="text-sm text-gray-700">
                  {booking.startTime} – {booking.endTime}
                </p>
              </div>

              <div className="pl-7">
                <p className="text-xs text-gray-500">Plano: {booking.servicePlanName}</p>
              </div>
            </div>

            {booking.cancellationReason ? (
              <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                <p className="font-medium">Motivo do cancelamento:</p>
                <p className="mt-0.5">{booking.cancellationReason}</p>
              </div>
            ) : null}

            {canAct ? (
              <div className="flex flex-wrap gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  className="gap-1.5 text-green-700 hover:bg-green-50 hover:text-green-800"
                  disabled={statusMutation.isPending}
                  onClick={() => statusMutation.mutate({ status: "completed" })}
                >
                  Marcar como concluído
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="gap-1.5 text-orange-600 hover:bg-orange-50 hover:text-orange-700"
                  disabled={statusMutation.isPending}
                  onClick={() => statusMutation.mutate({ status: "no-show" })}
                >
                  Não compareceu
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="gap-1.5 text-destructive hover:text-destructive"
                  disabled={statusMutation.isPending}
                  onClick={() => setCancelOpen(true)}
                >
                  Cancelar sessão
                </Button>
              </div>
            ) : null}
          </div>
        </DialogContent>
      </Dialog>

      <AlertDialog open={cancelOpen} onOpenChange={(open) => !open && setCancelOpen(false)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancelar agendamento</AlertDialogTitle>
            <AlertDialogDescription>
              Informe o motivo do cancelamento. O aluno será notificado.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="px-6 pb-2">
            <Label htmlFor="cancel-reason" className="text-sm">
              Motivo
            </Label>
            <Textarea
              id="cancel-reason"
              className="mt-1.5"
              rows={3}
              placeholder="Ex: Imprevisto pessoal..."
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
            />
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={cancelMutation.isPending}>Voltar</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={!cancelReason.trim() || cancelMutation.isPending}
              onClick={() => cancelMutation.mutate()}
            >
              {cancelMutation.isPending ? "Cancelando..." : "Confirmar cancelamento"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
