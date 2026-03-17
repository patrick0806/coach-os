"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Check, Copy, Link } from "lucide-react"

import { Button } from "@/shared/ui/button"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/ui/dialog"
import { Field, FieldError, FieldGroup, FieldLabel } from "@/shared/ui/field"
import { Input } from "@/shared/ui/input"
import { WhatsAppIcon } from "@/shared/ui/whatsapp-icon"
import { useInviteStudent } from "@/features/students/hooks/useInviteStudent"
import { useGenerateInviteLink } from "@/features/students/hooks/useGenerateInviteLink"

const schema = z.object({
  name: z.string().min(2, "Nome deve ter ao menos 2 caracteres"),
  email: z.string().email("Email inválido"),
})

type FormValues = z.infer<typeof schema>

type Step = "form" | "link"

interface InviteStudentDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function InviteStudentDialog({ open, onOpenChange }: InviteStudentDialogProps) {
  const [step, setStep] = useState<Step>("form")
  const [inviteLink, setInviteLink] = useState("")
  const [copied, setCopied] = useState(false)

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { name: "", email: "" },
  })

  const inviteStudent = useInviteStudent({ onOpenChange })
  const generateInviteLink = useGenerateInviteLink()

  function handleEmailInvite(values: FormValues) {
    inviteStudent.mutate(values)
  }

  async function handleGenerateLink() {
    const values = form.getValues()
    const valid = await form.trigger()
    if (!valid) return

    generateInviteLink.mutate(values, {
      onSuccess: (data) => {
        setInviteLink(data.inviteLink)
        setStep("link")
      },
    })
  }

  async function handleCopy() {
    await navigator.clipboard.writeText(inviteLink)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  function handleWhatsApp() {
    const text = encodeURIComponent(
      `Olá! Você foi convidado para acessar a plataforma. Clique no link para criar sua conta: ${inviteLink}`
    )
    window.open(`https://wa.me/?text=${text}`, "_blank")
  }

  function handleClose(open: boolean) {
    if (!open) {
      setStep("form")
      setInviteLink("")
      setCopied(false)
      form.reset()
    }
    onOpenChange(open)
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Convidar aluno</DialogTitle>
        </DialogHeader>

        {step === "form" && (
          <>
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="invite-name">Nome</FieldLabel>
                <Input
                  id="invite-name"
                  placeholder="Nome do aluno"
                  {...form.register("name")}
                />
                <FieldError errors={[form.formState.errors.name]} />
              </Field>
              <Field>
                <FieldLabel htmlFor="invite-email">Email</FieldLabel>
                <Input
                  id="invite-email"
                  type="email"
                  placeholder="email@exemplo.com"
                  {...form.register("email")}
                />
                <FieldError errors={[form.formState.errors.email]} />
              </Field>
            </FieldGroup>
            <DialogFooter className="flex-col gap-2 sm:flex-row">
              <Button
                type="button"
                variant="outline"
                className="w-full sm:w-auto"
                onClick={() => handleClose(false)}
              >
                Cancelar
              </Button>
              <Button
                type="button"
                variant="outline"
                className="w-full sm:w-auto"
                disabled={generateInviteLink.isPending}
                onClick={handleGenerateLink}
              >
                <Link className="mr-2 size-4" />
                {generateInviteLink.isPending ? "Gerando..." : "Gerar link"}
              </Button>
              <Button
                type="button"
                className="w-full sm:w-auto"
                disabled={inviteStudent.isPending}
                onClick={form.handleSubmit(handleEmailInvite)}
              >
                {inviteStudent.isPending ? "Enviando..." : "Enviar por e-mail"}
              </Button>
            </DialogFooter>
          </>
        )}

        {step === "link" && (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Compartilhe este link com o aluno para que ele possa criar sua conta.
            </p>
            <div className="flex items-center gap-2 rounded-md border border-border bg-muted p-3">
              <p className="flex-1 truncate text-sm font-mono">{inviteLink}</p>
            </div>
            <div className="flex flex-col gap-2 sm:flex-row">
              <Button
                type="button"
                variant="outline"
                className="flex-1"
                onClick={handleCopy}
              >
                {copied ? (
                  <Check className="mr-2 size-4 text-success" />
                ) : (
                  <Copy className="mr-2 size-4" />
                )}
                {copied ? "Copiado!" : "Copiar link"}
              </Button>
              <Button
                type="button"
                className="flex-1 bg-[#25D366] text-white hover:bg-[#22c35e]"
                onClick={handleWhatsApp}
              >
                <WhatsAppIcon className="mr-2" />
                Enviar no WhatsApp
              </Button>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => handleClose(false)}>
                Fechar
              </Button>
            </DialogFooter>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
