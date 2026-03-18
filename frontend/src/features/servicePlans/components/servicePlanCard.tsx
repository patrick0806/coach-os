"use client"

import { MoreHorizontal, Pencil, Trash2, Clock, Repeat } from "lucide-react"

import { Badge } from "@/shared/ui/badge"
import { Button } from "@/shared/ui/button"
import { Card, CardContent } from "@/shared/ui/card"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/shared/ui/dropdown-menu"
import type { ServicePlanItem } from "@/features/servicePlans/types/servicePlans.types"

interface ServicePlanCardProps {
  plan: ServicePlanItem
  onEdit: (plan: ServicePlanItem) => void
  onDelete: (plan: ServicePlanItem) => void
}

function formatPrice(price: string): string {
  const num = parseFloat(price)
  return num.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })
}

export function ServicePlanCard({ plan, onEdit, onDelete }: ServicePlanCardProps) {
  return (
    <Card className="group" data-testid="service-plan-card">
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1 space-y-2">
            <div className="flex items-center gap-2 flex-wrap">
              <p className="font-semibold text-sm truncate">{plan.name}</p>
              <Badge
                variant="secondary"
                className={
                  plan.attendanceType === "online"
                    ? "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300"
                    : "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300"
                }
              >
                {plan.attendanceType === "online" ? "Online" : "Presencial"}
              </Badge>
              {!plan.isActive && (
                <Badge variant="secondary" className="bg-muted text-muted-foreground">
                  Inativo
                </Badge>
              )}
            </div>

            {plan.description && (
              <p className="text-xs text-muted-foreground line-clamp-2">{plan.description}</p>
            )}

            <p className="text-lg font-bold text-foreground">{formatPrice(plan.price)}</p>

            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              {plan.sessionsPerWeek != null && (
                <span className="flex items-center gap-1">
                  <Repeat className="size-3" />
                  {plan.sessionsPerWeek}x / semana
                </span>
              )}
              {plan.durationMinutes != null && (
                <span className="flex items-center gap-1">
                  <Clock className="size-3" />
                  {plan.durationMinutes} min
                </span>
              )}
            </div>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="size-8 shrink-0 opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity"
                data-testid="service-plan-actions"
              >
                <MoreHorizontal className="size-4" />
                <span className="sr-only">Ações</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onEdit(plan)} data-testid="edit-service-plan">
                <Pencil className="mr-2 size-4" />
                Editar
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => onDelete(plan)}
                className="text-destructive focus:text-destructive"
                data-testid="delete-service-plan"
              >
                <Trash2 className="mr-2 size-4" />
                Excluir
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardContent>
    </Card>
  )
}
