import type { LucideIcon } from "lucide-react";
import { TrendingDown, TrendingUp, Minus } from "lucide-react";

import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";

type Trend = "up" | "down" | "neutral";

interface StatsCardProps {
  label: string;
  value: string | number;
  trend?: Trend;
  trendValue?: string;
  icon?: LucideIcon;
  className?: string;
}

const trendConfig: Record<Trend, { icon: LucideIcon; color: string }> = {
  up: { icon: TrendingUp, color: "text-success" },
  down: { icon: TrendingDown, color: "text-destructive" },
  neutral: { icon: Minus, color: "text-muted-foreground" },
};

export function StatsCard({
  label,
  value,
  trend,
  trendValue,
  icon: Icon,
  className,
}: StatsCardProps) {
  const trendInfo = trend ? trendConfig[trend] : null;

  return (
    <Card data-slot="stats-card" variant="glass" className={cn("relative", className)}>
      <CardContent className="flex items-start justify-between">
        <div className="space-y-1">
          <p className="text-sm text-muted-foreground">{label}</p>
          <p className="text-2xl font-bold tracking-tight">{value}</p>
          {trendInfo && trendValue && (
            <div className={cn("flex items-center gap-1 text-xs", trendInfo.color)}>
              <trendInfo.icon className="size-3" />
              <span>{trendValue}</span>
            </div>
          )}
        </div>
        {Icon && (
          <div className="rounded-lg bg-primary/10 p-2">
            <Icon className="size-5 text-primary" />
          </div>
        )}
      </CardContent>
    </Card>
  );
}
