"use client"

import { useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { AlertCircle } from "lucide-react"

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
import { useQuery } from "@tanstack/react-query"
import { servicePlansService } from "@/features/servicePlans/services/servicePlans.service"
import { useCreateContract } from "@/features/coachingContracts/hooks/useCreateContract"
import type { CoachingContractItem } from "@/features/coachingContracts/types/coachingContracts.types"

const schema = z.object({
  servicePlanId: z.string().min(1, "Selecione um plano"),
})

type FormData = z.infer<typeof schema>

interface AssignPlanDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  studentId: string
  activeContract?: CoachingContractItem | null
}

export function AssignPlanDialog({
  open,
  onOpenChange,
  studentId,
  activeContract,
}: AssignPlanDialogProps) {
  const { data: plans } = useQuery({
    queryKey: ["service-plans"],
    queryFn: () => servicePlansService.list(),
    enabled: open,
  })
  const create = useCreateContract({ studentId, onOpenChange })

  const {
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { servicePlanId: "" },
  })

  const selectedPlanId = watch("servicePlanId")

  useEffect(() => {
    if (!open) reset()
  }, [open, reset])

  function onSubmit(data: FormData) {
    create.mutate({ servicePlanId: data.servicePlanId })
  }

  const activePlans = plans?.filter((p) => p.isActive) ?? []

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent data-testid="assign-plan-dialog">
        <DialogHeader>
          <DialogTitle>
            {activeContract ? "Trocar plano de serviço" : "Vincular plano de serviço"}
          </DialogTitle>
        </DialogHeader>

        {activeContract && (
          <div className="flex items-start gap-2 rounded-md border border-warning/40 bg-warning/10 px-3 py-2 text-sm text-warning-foreground">
            <AlertCircle className="mt-0.5 size-4 shrink-0 text-warning" />
            <span>
              O plano atual (<strong>{activeContract.servicePlan.name}</strong>) será substituído
              pelo novo plano selecionado.
            </span>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="service-plan-select">Plano de serviço</Label>
            <Select
              value={selectedPlanId}
              onValueChange={(val) => setValue("servicePlanId", val)}
            >
              <SelectTrigger id="service-plan-select" data-testid="service-plan-select">
                <SelectValue placeholder="Selecionar plano..." />
              </SelectTrigger>
              <SelectContent>
                {activePlans.map((plan) => (
                  <SelectItem key={plan.id} value={plan.id}>
                    {plan.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.servicePlanId && (
              <p className="text-xs text-destructive">{errors.servicePlanId.message}</p>
            )}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={create.isPending}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={create.isPending}
              data-testid="assign-plan-submit"
            >
              {create.isPending ? "Vinculando..." : activeContract ? "Trocar plano" : "Vincular plano"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
