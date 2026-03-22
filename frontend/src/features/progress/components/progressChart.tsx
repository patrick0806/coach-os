"use client"

import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { TrendingUp } from "lucide-react"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts"

import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card"
import { EmptyState } from "@/shared/components/emptyState"
import type { ProgressChartDataPoint } from "@/features/progress/types/progress.types"

interface ProgressChartProps {
  data: ProgressChartDataPoint[]
  label: string
  unit: string
  isLoading?: boolean
}

function CustomTooltip({ active, payload }: { active?: boolean; payload?: Array<{ payload: ProgressChartDataPoint & { formattedDate: string } }> }) {
  if (!active || !payload?.[0]) return null

  const point = payload[0].payload as ProgressChartDataPoint & { formattedDate: string }

  return (
    <div className="rounded-md border bg-popover px-3 py-2 text-sm text-popover-foreground shadow-md">
      <p className="font-medium">{point.formattedDate}</p>
      <p className="text-muted-foreground">
        {Number(point.value).toLocaleString("pt-BR")} {point.unit}
      </p>
    </div>
  )
}

export function ProgressChart({ data, label, unit, isLoading }: ProgressChartProps) {
  if (isLoading) {
    return (
      <Card data-testid="progress-chart">
        <CardContent className="h-[250px] flex items-center justify-center">
          <div className="animate-pulse text-sm text-muted-foreground">Carregando gráfico...</div>
        </CardContent>
      </Card>
    )
  }

  if (data.length === 0) {
    return (
      <Card data-testid="progress-chart">
        <CardContent className="py-6">
          <EmptyState
            icon={TrendingUp}
            title="Sem dados para o gráfico"
            description={`Nenhum registro de ${label} encontrado.`}
          />
        </CardContent>
      </Card>
    )
  }

  const chartData = data.map((point) => ({
    ...point,
    numericValue: Number(point.value),
    formattedDate: format(new Date(point.recordedAt), "dd 'de' MMM", { locale: ptBR }),
    shortDate: format(new Date(point.recordedAt), "dd/MM"),
  }))

  return (
    <Card data-testid="progress-chart">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {label} ({unit})
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={250}>
          <LineChart data={chartData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
            <XAxis
              dataKey="shortDate"
              tick={{ fontSize: 12 }}
              className="fill-muted-foreground"
            />
            <YAxis
              tick={{ fontSize: 12 }}
              className="fill-muted-foreground"
              domain={["auto", "auto"]}
            />
            <Tooltip content={<CustomTooltip />} />
            <Line
              type="monotone"
              dataKey="numericValue"
              stroke="var(--color-chart-1)"
              strokeWidth={2}
              dot={{ r: 4, fill: "var(--color-chart-1)" }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
