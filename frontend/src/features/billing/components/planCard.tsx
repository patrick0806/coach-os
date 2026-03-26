"use client"

import { Check, Star } from "lucide-react"
import { formatMoney } from "@/lib/formatMoney"
import { Badge } from "@/shared/ui/badge"
import { Button } from "@/shared/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/shared/ui/card"

interface PlanCardProps {
  id: string
  name: string
  price: string
  maxStudents: number
  highlighted: boolean
  benefits?: string[] | null
  isCurrentPlan: boolean
  isTrialing?: boolean
  onSelect: (planId: string) => void
  isLoading: boolean
}

export function PlanCard({
  id,
  name,
  price,
  maxStudents,
  highlighted,
  benefits,
  isCurrentPlan,
  isTrialing,
  onSelect,
  isLoading,
}: PlanCardProps) {
  return (
    <div className="relative pt-3">
      {highlighted && (
        <div className="absolute top-0 left-1/2 -translate-x-1/2 z-10">
          <Badge className="gap-1">
            <Star className="size-3 fill-current" />
            Mais popular
          </Badge>
        </div>
      )}
      <Card className={highlighted ? "ring-2 ring-primary" : ""}>
        <CardHeader className="text-center">
          <CardTitle className="text-lg">{name}</CardTitle>
          <div className="mt-2">
            <span className="text-3xl font-bold">
              {formatMoney(Number(price))}
            </span>
            <span className="text-muted-foreground">/mês</span>
          </div>
          <p className="text-sm text-muted-foreground">Até {maxStudents} alunos</p>
        </CardHeader>
        <CardContent>
          {benefits && benefits.length > 0 && (
            <ul className="space-y-2">
              {benefits.map((benefit) => (
                <li key={benefit} className="flex items-center gap-2 text-sm">
                  <Check className="size-4 shrink-0 text-primary" />
                  {benefit}
                </li>
              ))}
            </ul>
          )}
        </CardContent>
        <CardFooter>
          {isCurrentPlan ? (
            <Button variant="secondary" className="w-full" disabled>
              Plano atual
            </Button>
          ) : isTrialing ? (
            <Button variant="outline" className="w-full" disabled>
              Assinar primeiro
            </Button>
          ) : (
            <Button
              className="w-full"
              onClick={() => onSelect(id)}
              disabled={isLoading}
              variant={highlighted ? "default" : "outline"}
            >
              {isLoading ? "Aguarde..." : "Mudar para este plano"}
            </Button>
          )}
        </CardFooter>
      </Card>
    </div>
  )
}
