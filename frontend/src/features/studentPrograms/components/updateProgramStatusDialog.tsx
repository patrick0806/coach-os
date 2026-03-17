"use client"

import { useEffect } from "react"
import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { AlertTriangle } from "lucide-react"

import { Button } from "@/shared/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/shared/ui/dialog"
import { Label } from "@/shared/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/ui/select"
import { useUpdateStudentProgramStatus } from "@/features/studentPrograms/hooks/useUpdateStudentProgramStatus"
import type {
  StudentProgramItem,
  StudentProgramStatus,
} from "@/features/studentPrograms/types/studentPrograms.types"

const schema = z.object({
  status: z.enum(["active", "finished", "cancelled"]),
})

type FormData = z.infer<typeof schema>

interface UpdateProgramStatusDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  program: StudentProgramItem
  studentId: string
}

const statusLabels: Record<StudentProgramStatus, string> = {
  active: "Ativo",
  finished: "Finalizado",
  cancelled: "Cancelado",
}

export function UpdateProgramStatusDialog({
  open,
  onOpenChange,
  program,
  studentId,
}: UpdateProgramStatusDialogProps) {
  const updateStatus = useUpdateStudentProgramStatus({ studentId, onOpenChange })

  const { control, handleSubmit, reset, watch } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { status: program.status },
  })

  const selectedStatus = watch("status")
  const isIrreversible = selectedStatus === "finished" || selectedStatus === "cancelled"

  useEffect(() => {
    if (open) reset({ status: program.status })
  }, [open, program.status, reset])

  function onSubmit(data: FormData) {
    updateStatus.mutate({ id: program.id, data: { status: data.status } })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Alterar status do programa</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label>Status</Label>
            <Controller
              control={control}
              name="status"
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger data-testid="program-status-select">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {(["active", "finished", "cancelled"] as StudentProgramStatus[]).map((s) => (
                      <SelectItem key={s} value={s}>
                        {statusLabels[s]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </div>

          {isIrreversible && (
            <div className="flex items-start gap-2 rounded-md border border-warning/30 bg-warning/10 p-3 text-sm text-warning-foreground">
              <AlertTriangle className="mt-0.5 size-4 shrink-0 text-warning" />
              <p>
                Alterar para <strong>{statusLabels[selectedStatus]}</strong> é uma ação irreversível.
                O programa não poderá ser reativado automaticamente.
              </p>
            </div>
          )}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={updateStatus.isPending}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={updateStatus.isPending}
              data-testid="update-status-submit"
            >
              {updateStatus.isPending ? "Salvando..." : "Confirmar"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
