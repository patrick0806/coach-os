"use client"

import { format, parseISO } from "date-fns"
import { ptBR } from "date-fns/locale"
import { Check, X, Inbox } from "lucide-react"

import { Button } from "@/shared/ui/button"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/shared/ui/sheet"
import { Badge } from "@/shared/ui/badge"
import { useAppointmentRequests } from "@/features/scheduling/hooks/useAppointmentRequests"
import { useApproveAppointmentRequest } from "@/features/scheduling/hooks/useApproveAppointmentRequest"
import { useRejectAppointmentRequest } from "@/features/scheduling/hooks/useRejectAppointmentRequest"

interface PendingRequestsSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function PendingRequestsSheet({ open, onOpenChange }: PendingRequestsSheetProps) {
  const { data, isLoading } = useAppointmentRequests({ status: "pending", size: 50 })
  const approve = useApproveAppointmentRequest()
  const reject = useRejectAppointmentRequest()

  const requests = data?.content ?? []

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-md">
        <SheetHeader>
          <SheetTitle>Solicitações pendentes</SheetTitle>
          <SheetDescription>
            Aprove ou rejeite as solicitações de agendamento dos seus alunos.
          </SheetDescription>
        </SheetHeader>

        <div className="mt-6 space-y-4 overflow-y-auto">
          {isLoading && (
            <p className="text-sm text-muted-foreground">Carregando...</p>
          )}

          {!isLoading && requests.length === 0 && (
            <div className="flex flex-col items-center gap-2 py-12 text-center">
              <Inbox className="size-10 text-muted-foreground/40" />
              <p className="text-sm font-medium">Nenhuma solicitação pendente</p>
              <p className="text-xs text-muted-foreground">
                Quando seus alunos solicitarem agendamentos, eles aparecerão aqui.
              </p>
            </div>
          )}

          {requests.map((req) => {
            const start = parseISO(req.requestedStartAt)
            const end = parseISO(req.requestedEndAt)
            const isPending =
              approve.isPending || reject.isPending

            return (
              <div
                key={req.id}
                className="rounded-lg border border-border p-4 space-y-3"
                data-testid="request-item"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="text-sm font-medium">{req.studentName}</p>
                    <p className="text-xs text-muted-foreground capitalize">
                      {format(start, "PPP", { locale: ptBR })}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {format(start, "HH:mm")} – {format(end, "HH:mm")}
                    </p>
                  </div>
                  <Badge variant="outline" className="capitalize shrink-0">
                    {req.type === "online" ? "Online" : "Presencial"}
                  </Badge>
                </div>

                {req.notes && (
                  <p className="text-xs text-muted-foreground bg-muted/50 rounded p-2">
                    {req.notes}
                  </p>
                )}

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 text-destructive hover:text-destructive"
                    onClick={() => reject.mutate(req.id)}
                    disabled={isPending}
                    data-testid="reject-request-btn"
                  >
                    <X className="size-3.5 mr-1" />
                    Rejeitar
                  </Button>
                  <Button
                    size="sm"
                    className="flex-1"
                    onClick={() => approve.mutate({ id: req.id })}
                    disabled={isPending}
                    data-testid="approve-request-btn"
                  >
                    <Check className="size-3.5 mr-1" />
                    Aprovar
                  </Button>
                </div>
              </div>
            )
          })}
        </div>
      </SheetContent>
    </Sheet>
  )
}
