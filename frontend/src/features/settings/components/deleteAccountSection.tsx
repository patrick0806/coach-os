"use client"

import { useState } from "react"
import { Loader2 } from "lucide-react"
import { useMutation } from "@tanstack/react-query"
import { toast } from "sonner"

import { Button } from "@/shared/ui/button"
import { Input } from "@/shared/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/ui/card"
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/shared/ui/alert-dialog"
import { profileService } from "@/features/profileEditor/services/profile.service"
import { authService } from "@/features/auth/services/auth.service"

const CONFIRMATION_TEXT = "EXCLUIR"

export function DeleteAccountSection() {
  const [open, setOpen] = useState(false)
  const [confirmation, setConfirmation] = useState("")

  const deleteAccount = useMutation({
    mutationFn: () => profileService.deleteAccount(),
    onSuccess: () => {
      authService.logout()
      window.location.href = "/login"
    },
    onError: () => {
      toast.error("Erro ao excluir conta. Tente novamente.")
    },
  })

  function handleClose() {
    setOpen(false)
    setConfirmation("")
  }

  function handleConfirm() {
    if (confirmation !== CONFIRMATION_TEXT) return
    deleteAccount.mutate()
  }

  return (
    <>
      <Card data-testid="delete-account-section" className="border-destructive/30">
        <CardHeader>
          <CardTitle className="text-destructive">Excluir conta</CardTitle>
          <CardDescription>
            Ao excluir sua conta, todos os seus dados serao permanentemente removidos, incluindo alunos, treinos, fotos de progresso e agendamentos. Se voce tiver uma assinatura ativa, ela sera cancelada imediatamente.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button
            variant="destructive"
            onClick={() => setOpen(true)}
            data-testid="open-delete-dialog"
          >
            Excluir minha conta
          </Button>
        </CardContent>
      </Card>

      <AlertDialog open={open} onOpenChange={(isOpen) => !isOpen && handleClose()}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir conta permanentemente</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acao e irreversivel. Todos os seus dados serao excluidos permanentemente, incluindo alunos, treinos, fotos e agendamentos. Se voce tiver uma assinatura ativa, ela sera cancelada.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">
              Digite <span className="font-semibold text-foreground">{CONFIRMATION_TEXT}</span> para confirmar:
            </p>
            <Input
              value={confirmation}
              onChange={(e) => setConfirmation(e.target.value)}
              placeholder={CONFIRMATION_TEXT}
              data-testid="delete-confirmation-input"
              disabled={deleteAccount.isPending}
            />
          </div>

          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteAccount.isPending}>
              Cancelar
            </AlertDialogCancel>
            <Button
              variant="destructive"
              onClick={handleConfirm}
              disabled={confirmation !== CONFIRMATION_TEXT || deleteAccount.isPending}
              data-testid="confirm-delete-button"
            >
              {deleteAccount.isPending ? (
                <>
                  <Loader2 className="mr-2 size-3.5 animate-spin" />
                  Excluindo...
                </>
              ) : (
                "Excluir conta"
              )}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
