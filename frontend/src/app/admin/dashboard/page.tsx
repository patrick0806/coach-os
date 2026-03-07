"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Area,
  AreaChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { DollarSign, TrendingDown, TrendingUp, Users } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  getDashboardCharts,
  getDashboardStats,
  type DashboardPeriod,
} from "@/services/admin.service";

// ─── Period filter ────────────────────────────────────────────────────────────

const PERIODS: { value: DashboardPeriod; label: string }[] = [
  { value: "7d", label: "7 dias" },
  { value: "30d", label: "30 dias" },
  { value: "90d", label: "90 dias" },
  { value: "all", label: "Todo período" },
];

// ─── KPI card ─────────────────────────────────────────────────────────────────

interface KpiCardProps {
  title: string;
  value: string;
  icon: React.ReactNode;
  loading: boolean;
}

function KpiCard({ title, value, icon, loading }: KpiCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        <div className="text-muted-foreground">{icon}</div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="h-8 w-24 animate-pulse rounded bg-accent" />
        ) : (
          <p className="text-2xl font-bold text-foreground">{value}</p>
        )}
      </CardContent>
    </Card>
  );
}

const CHART_COLORS = ["#6366f1", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6"];

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function AdminDashboardPage() {
  const [period, setPeriod] = useState<DashboardPeriod>("30d");

  const { data: stats, isLoading: loadingStats } = useQuery({
    queryKey: ["admin-stats", period],
    queryFn: () => getDashboardStats(period),
  });

  const { data: charts, isLoading: loadingCharts } = useQuery({
    queryKey: ["admin-charts", period],
    queryFn: () => getDashboardCharts(period),
  });

  const mrrFormatted = stats
    ? stats.mrr.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })
    : "—";

  return (
    <div className="p-4 sm:p-8">
      {/* Header */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Dashboard</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Visão geral da plataforma.
          </p>
        </div>

        {/* Period selector */}
        <div className="flex gap-1 rounded-lg border border-border bg-card p-1">
          {PERIODS.map((p) => (
            <button
              key={p.value}
              onClick={() => setPeriod(p.value)}
              className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                period === p.value
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* KPIs */}
      <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5">
        <KpiCard
          title="MRR"
          value={mrrFormatted}
          icon={<DollarSign className="size-4" />}
          loading={loadingStats}
        />
        <KpiCard
          title="Assinantes ativos"
          value={stats ? String(stats.totalSubscribers) : "—"}
          icon={<Users className="size-4" />}
          loading={loadingStats}
        />
        <KpiCard
          title="Novos assinantes"
          value={stats ? `+${stats.newSubscribers}` : "—"}
          icon={<TrendingUp className="size-4" />}
          loading={loadingStats}
        />
        <KpiCard
          title="Churn rate"
          value={stats ? `${stats.churnRate.toFixed(1)}%` : "—"}
          icon={<TrendingDown className="size-4" />}
          loading={loadingStats}
        />
        <KpiCard
          title="Total de alunos"
          value={stats ? String(stats.totalStudents) : "—"}
          icon={<Users className="size-4" />}
          loading={loadingStats}
        />
      </div>

      {/* Charts */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Revenue area chart */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">Crescimento de receita</CardTitle>
          </CardHeader>
          <CardContent>
            {loadingCharts ? (
              <div className="h-64 animate-pulse rounded-lg bg-accent" />
            ) : (
              <ResponsiveContainer width="100%" height={256}>
                <AreaChart data={charts?.revenue ?? []}>
                  <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis
                    dataKey="month"
                    tick={{ fontSize: 11, fill: "#6b7280" }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fontSize: 11, fill: "#6b7280" }}
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={(v: number) =>
                      v.toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 })
                    }
                  />
                  <Tooltip
                    formatter={(value) =>
                      (value as number).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })
                    }
                    contentStyle={{
                      background: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                      fontSize: "12px",
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="amount"
                    name="Receita"
                    stroke="#6366f1"
                    strokeWidth={2}
                    fill="url(#colorRevenue)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Plan distribution pie chart */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Distribuição de planos</CardTitle>
          </CardHeader>
          <CardContent>
            {loadingCharts ? (
              <div className="h-64 animate-pulse rounded-lg bg-accent" />
            ) : !charts?.planDistribution.length ? (
              <div className="flex h-64 items-center justify-center text-sm text-muted-foreground">
                Sem dados no período.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={256}>
                <PieChart>
                  <Pie
                    data={charts.planDistribution}
                    dataKey="count"
                    nameKey="planName"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    label={({ name, percent }: { name?: string; percent?: number }) =>
                      `${name ?? ""} ${((percent ?? 0) * 100).toFixed(0)}%`
                    }
                    labelLine={false}
                  >
                    {charts.planDistribution.map((_, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={CHART_COLORS[index % CHART_COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value) => [`${value as number} assinantes`, ""]}
                    contentStyle={{
                      background: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                      fontSize: "12px",
                    }}
                  />
                  <Legend
                    formatter={(value) => (
                      <span style={{ fontSize: "12px", color: "#9ca3af" }}>{value}</span>
                    )}
                  />
                </PieChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
