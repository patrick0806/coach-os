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
import type { ProgressChartDataPoint, MetricType } from "@/features/progress/types/progress.types"
import { METRIC_TYPE_LABELS, METRIC_TYPE_UNITS } from "@/features/progress/types/progress.types"

const CHART_COLORS = [
  "var(--color-chart-1)",
  "var(--color-chart-2)",
  "var(--color-chart-3)",
  "var(--color-chart-4)",
  "var(--color-chart-5)",
]

interface CombinedProgressChartProps {
  data: ProgressChartDataPoint[]
  isLoading?: boolean
}

function MiniTooltip({ active, payload }: { active?: boolean; payload?: Array<{ payload: { formattedDate: string; value: string; unit: string } }> }) {
  if (!active || !payload?.[0]) return null

  const point = payload[0].payload

  return (
    <div className="rounded-md border bg-popover px-3 py-2 text-sm text-popover-foreground shadow-md">
      <p className="font-medium">{point.formattedDate}</p>
      <p className="text-muted-foreground">
        {Number(point.value).toLocaleString("pt-BR")} {point.unit}
      </p>
    </div>
  )
}

export function CombinedProgressChart({ data, isLoading }: CombinedProgressChartProps) {
  if (isLoading) {
    return (
      <Card data-testid="combined-progress-chart">
        <CardContent className="h-[250px] flex items-center justify-center">
          <div className="animate-pulse text-sm text-muted-foreground">Carregando gráficos...</div>
        </CardContent>
      </Card>
    )
  }

  if (data.length === 0) {
    return (
      <Card data-testid="combined-progress-chart">
        <CardContent className="py-6">
          <EmptyState
            icon={TrendingUp}
            title="Sem dados para o gráfico"
            description="Nenhum registro de evolução encontrado."
          />
        </CardContent>
      </Card>
    )
  }

  // Group data by metricType
  const grouped = new Map<string, ProgressChartDataPoint[]>()
  for (const point of data) {
    const key = point.metricType ?? "unknown"
    if (!grouped.has(key)) grouped.set(key, [])
    grouped.get(key)!.push(point)
  }

  const metricTypes = Array.from(grouped.keys()) as MetricType[]

  return (
    <Card data-testid="combined-progress-chart">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          Evolução Geral
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {metricTypes.map((metricType, index) => {
          const points = grouped.get(metricType) ?? []
          const label = METRIC_TYPE_LABELS[metricType] ?? metricType
          const unit = METRIC_TYPE_UNITS[metricType] ?? points[0]?.unit ?? ""
          const color = CHART_COLORS[index % CHART_COLORS.length]

          const chartData = points.map((point) => ({
            ...point,
            numericValue: Number(point.value),
            formattedDate: format(new Date(point.recordedAt), "dd 'de' MMM", { locale: ptBR }),
            shortDate: format(new Date(point.recordedAt), "dd/MM"),
          }))

          return (
            <div key={metricType} data-testid={`metric-chart-${metricType}`}>
              <p className="text-xs font-medium text-muted-foreground mb-1">
                {label} ({unit})
              </p>
              <ResponsiveContainer width="100%" height={140}>
                <LineChart data={chartData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis
                    dataKey="shortDate"
                    tick={{ fontSize: 10 }}
                    className="fill-muted-foreground"
                  />
                  <YAxis
                    tick={{ fontSize: 10 }}
                    className="fill-muted-foreground"
                    domain={["auto", "auto"]}
                    width={40}
                  />
                  <Tooltip content={<MiniTooltip />} />
                  <Line
                    type="monotone"
                    dataKey="numericValue"
                    stroke={color}
                    strokeWidth={2}
                    dot={{ r: 3, fill: color }}
                    activeDot={{ r: 5 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )
        })}
      </CardContent>
    </Card>
  )
}
