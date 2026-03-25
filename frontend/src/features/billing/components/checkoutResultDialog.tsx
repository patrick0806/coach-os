"use client"

import { CheckCircle2, XCircle } from "lucide-react"

import { Button } from "@/shared/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/ui/dialog"

interface CheckoutResultDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  variant: "success" | "cancelled"
}

const content = {
  success: {
    icon: <CheckCircle2 className="mx-auto mb-2 size-12 text-green-500" />,
    title: "Assinatura ativada!",
    description:
      "Seu pagamento foi processado com sucesso. Agora você tem acesso completo ao seu plano. Bem-vindo ao Coach OS!",
    button: "Continuar",
  },
  cancelled: {
    icon: <XCircle className="mx-auto mb-2 size-12 text-destructive" />,
    title: "Pagamento não concluído",
    description:
      "Você saiu do checkout antes de finalizar o pagamento. Sua assinatura não foi alterada. Clique em \"Assinar agora\" quando quiser tentar novamente.",
    button: "Fechar",
  },
}

export function CheckoutResultDialog({ open, onOpenChange, variant }: CheckoutResultDialogProps) {
  const { icon, title, description, button } = content[variant]

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="text-center">{icon}</div>
          <DialogTitle className="text-center">{title}</DialogTitle>
          <DialogDescription className="text-center">{description}</DialogDescription>
        </DialogHeader>
        <DialogFooter className="sm:justify-center">
          <Button onClick={() => onOpenChange(false)}>{button}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
