"use client"

import { Button } from "@/shared/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/ui/dialog"
import { formatLongDate } from "@/shared/utils/formatDate"

interface CancelSubscriptionDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  subscriptionExpiresAt: string | null
  onConfirm: () => void
  isLoading: boolean
}

export function CancelSubscriptionDialog({
  open,
  onOpenChange,
  subscriptionExpiresAt,
  onConfirm,
  isLoading,
}: CancelSubscriptionDialogProps) {
  const expiresFormatted = subscriptionExpiresAt
    ? formatLongDate(subscriptionExpiresAt)
    : null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Cancelar assinatura</DialogTitle>
          <DialogDescription>
            {expiresFormatted
              ? `Sua assinatura será cancelada, mas você ainda terá acesso até ${expiresFormatted}. Após essa data, o acesso será encerrado.`
              : "Sua assinatura será cancelada ao final do período atual. Você ainda terá acesso até o fim do período pago."}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>
            Manter assinatura
          </Button>
          <Button variant="destructive" onClick={onConfirm} disabled={isLoading}>
            {isLoading ? "Cancelando..." : "Confirmar cancelamento"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
