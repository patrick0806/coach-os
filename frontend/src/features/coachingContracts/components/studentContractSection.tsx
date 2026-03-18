"use client"

import { useState } from "react"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { ClipboardList, Clock, Repeat, XCircle } from "lucide-react"

import { Badge } from "@/shared/ui/badge"
import { Button } from "@/shared/ui/button"
import { Card, CardContent } from "@/shared/ui/card"
import { EmptyState } from "@/shared/components/emptyState"
import { LoadingState } from "@/shared/components/loadingState"
import { useStudentContracts } from "@/features/coachingContracts/hooks/useStudentContracts"
import { useCancelContract } from "@/features/coachingContracts/hooks/useCancelContract"
import { AssignPlanDialog } from "@/features/coachingContracts/components/assignPlanDialog"
import type { CoachingContractItem } from "@/features/coachingContracts/types/coachingContracts.types"

interface StudentContractSectionProps {
  studentId: string
}

function formatPrice(price: string): string {
  const num = parseFloat(price)
  return num.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })
}

function formatDate(date: string | null | undefined): string {
  if (!date) return "—"
  return format(new Date(date), "dd/MM/yyyy", { locale: ptBR })
}

function ContractStatusBadge({ status }: { status: CoachingContractItem["status"] }) {
  if (status === "active") {
    return (
      <Badge className="bg-success/15 text-success hover:bg-success/15">Ativo</Badge>
    )
  }
  if (status === "cancelled") {
    return (
      <Badge variant="secondary" className="bg-destructive/10 text-destructive">
        Cancelado
      </Badge>
    )
  }
  return (
    <Badge variant="secondary" className="bg-muted text-muted-foreground">
      Expirado
    </Badge>
  )
}

export function StudentContractSection({ studentId }: StudentContractSectionProps) {
  const [assignOpen, setAssignOpen] = useState(false)
  const { data: contracts, isLoading } = useStudentContracts(studentId)
  const cancelContract = useCancelContract(studentId)

  if (isLoading) {
    return <LoadingState variant="card" />
  }

  const activeContract = contracts?.find((c) => c.status === "active") ?? null
  const pastContracts = contracts?.filter((c) => c.status !== "active") ?? []

  return (
    <div className="space-y-6" data-testid="student-contract-section">
      {/* Active plan */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
            Plano atual
          </h3>
          {activeContract ? (
            <Button
              size="sm"
              variant="outline"
              onClick={() => setAssignOpen(true)}
              data-testid="change-plan-button"
            >
              Trocar plano
            </Button>
          ) : (
            <Button
              size="sm"
              onClick={() => setAssignOpen(true)}
              data-testid="assign-plan-button"
            >
              Vincular plano
            </Button>
          )}
        </div>

        {activeContract ? (
          <Card className="border-primary/20 bg-primary/5" data-testid="active-contract-card">
            <CardContent className="p-5">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0 flex-1 space-y-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-semibold">{activeContract.servicePlan.name}</p>
                    <Badge
                      variant="secondary"
                      className={
                        activeContract.servicePlan.attendanceType === "online"
                          ? "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300"
                          : "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300"
                      }
                    >
                      {activeContract.servicePlan.attendanceType === "online" ? "Online" : "Presencial"}
                    </Badge>
                    <ContractStatusBadge status={activeContract.status} />
                  </div>

                  <p className="text-2xl font-bold">
                    {formatPrice(activeContract.servicePlan.price)}
                  </p>

                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    {activeContract.servicePlan.sessionsPerWeek != null && (
                      <span className="flex items-center gap-1">
                        <Repeat className="size-3" />
                        {activeContract.servicePlan.sessionsPerWeek}x / semana
                      </span>
                    )}
                    {activeContract.servicePlan.durationMinutes != null && (
                      <span className="flex items-center gap-1">
                        <Clock className="size-3" />
                        {activeContract.servicePlan.durationMinutes} min
                      </span>
                    )}
                    <span className="flex items-center gap-1">
                      Desde {formatDate(activeContract.startDate)}
                    </span>
                  </div>
                </div>

                <Button
                  variant="ghost"
                  size="icon"
                  className="size-8 shrink-0 text-muted-foreground hover:text-destructive"
                  onClick={() => cancelContract.mutate(activeContract.id)}
                  disabled={cancelContract.isPending}
                  data-testid="cancel-contract-button"
                >
                  <XCircle className="size-4" />
                  <span className="sr-only">Cancelar contrato</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <EmptyState
            icon={ClipboardList}
            title="Nenhum plano vinculado"
            description="Vincule um plano de serviço para acompanhar o que o aluno contratou."
            action={
              <Button size="sm" onClick={() => setAssignOpen(true)} data-testid="assign-plan-button-empty">
                Vincular plano
              </Button>
            }
          />
        )}
      </div>

      {/* Past contracts history */}
      {pastContracts.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
            Histórico
          </h3>
          <div className="space-y-2">
            {pastContracts.map((contract) => (
              <Card key={contract.id} data-testid="past-contract-card">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="text-sm font-medium truncate">
                          {contract.servicePlan.name}
                        </p>
                        <ContractStatusBadge status={contract.status} />
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        {formatDate(contract.startDate)}
                        {contract.endDate ? ` → ${formatDate(contract.endDate)}` : ""}
                      </p>
                    </div>
                    <p className="text-sm font-semibold shrink-0">
                      {formatPrice(contract.servicePlan.price)}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      <AssignPlanDialog
        open={assignOpen}
        onOpenChange={setAssignOpen}
        studentId={studentId}
        activeContract={activeContract}
      />
    </div>
  )
}
