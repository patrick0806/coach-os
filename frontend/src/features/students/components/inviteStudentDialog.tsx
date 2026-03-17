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
import {
  useGenerateStudentAccessLink,
  useSendStudentAccessEmail,
} from "@/features/students/hooks/useSendStudentAccess"

const schema = z.object({
  name: z.string().min(2, "Nome deve ter ao menos 2 caracteres"),
  email: z.string().email("Email inválido"),
})

type FormValues = z.infer<typeof schema>

type Step = "form" | "link"

interface StudentRef {
  id: string
  name: string
  email: string
}

interface InviteStudentDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  student?: StudentRef
}

export function InviteStudentDialog({ open, onOpenChange, student }: InviteStudentDialogProps) {
  const [step, setStep] = useState<Step>("form")
  const [inviteLink, setInviteLink] = useState("")
  const [copied, setCopied] = useState(false)

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { name: "", email: "" },
  })

  // Hooks for new students (no account yet)
  const inviteStudent = useInviteStudent({ onOpenChange })
  const generateInviteLink = useGenerateInviteLink()

  // Hooks for existing students (account exists, needs password setup)
  const sendAccessEmail = useSendStudentAccessEmail(student?.id ?? "", {
    onSuccess: () => handleClose(false),
  })
  const generateAccessLink = useGenerateStudentAccessLink(student?.id ?? "")

  function handleEmailInvite(values: FormValues) {
    if (student) {
      sendAccessEmail.mutate()
    } else {
      inviteStudent.mutate(values)
    }
  }

  async function handleGenerateLink() {
    if (student) {
      generateAccessLink.mutate(undefined, {
        onSuccess: (data) => {
          setInviteLink(data.accessLink)
          setStep("link")
        },
      })
      return
    }

    const valid = await form.trigger()
    if (!valid) return

    generateInviteLink.mutate(form.getValues(), {
      onSuccess: (data) => {
        setInviteLink(data.inviteLink)
        setStep("link")
      },
    })
  }

  const isEmailPending = student ? sendAccessEmail.isPending : inviteStudent.isPending
  const isLinkPending = student ? generateAccessLink.isPending : generateInviteLink.isPending

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

  const title = student ? `Convidar ${student.name}` : "Convidar aluno"

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>

        {step === "form" && (
          <>
            {student ? (
              // Pre-filled mode: show read-only student info
              <div className="space-y-3 rounded-md border border-border bg-muted/40 p-4">
                <div>
                  <p className="text-xs text-muted-foreground">Nome</p>
                  <p className="font-medium">{student.name}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Email</p>
                  <p className="font-medium">{student.email}</p>
                </div>
              </div>
            ) : (
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
            )}
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
                disabled={isLinkPending}
                onClick={handleGenerateLink}
              >
                <Link className="mr-2 size-4" />
                {isLinkPending ? "Gerando..." : "Gerar link"}
              </Button>
              <Button
                type="button"
                className="w-full sm:w-auto"
                disabled={isEmailPending}
                onClick={student
                  ? () => handleEmailInvite({ name: student.name, email: student.email })
                  : form.handleSubmit(handleEmailInvite)
                }
              >
                {isEmailPending ? "Enviando..." : "Enviar por e-mail"}
              </Button>
            </DialogFooter>
          </>
        )}

        {step === "link" && (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Compartilhe este link com o aluno para que ele possa criar sua conta.
            </p>
            <div className="rounded-md border border-border bg-muted p-3 overflow-hidden">
              <p className="text-xs font-mono break-all text-muted-foreground">{inviteLink}</p>
            </div>
            <div className="flex flex-col gap-2">
              <Button
                type="button"
                variant="outline"
                className="w-full"
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
                className="w-full bg-[#25D366] text-white hover:bg-[#22c35e]"
                onClick={handleWhatsApp}
              >
                <WhatsAppIcon className="mr-2" />
                Enviar no WhatsApp
              </Button>
              <Button
                type="button"
                variant="ghost"
                className="w-full"
                onClick={() => handleClose(false)}
              >
                Fechar
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
