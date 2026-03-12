import { Wifi, Home, Users } from "lucide-react";

import type { AttendanceType } from "@/services/service-plans.service";

const config: Record<
  AttendanceType,
  { label: string; icon: React.ElementType; className: string }
> = {
  online: {
    label: "Online",
    icon: Wifi,
    className:
      "bg-blue-500/10 text-blue-600 border border-blue-500/20 backdrop-blur-sm dark:bg-blue-400/10 dark:text-blue-400",
  },
  presential: {
    label: "Presencial",
    icon: Users,
    className:
      "bg-violet-500/10 text-violet-600 border border-violet-500/20 backdrop-blur-sm dark:bg-violet-400/10 dark:text-violet-400",
  },
  residential: {
    label: "Residencial",
    icon: Home,
    className:
      "bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 backdrop-blur-sm dark:bg-emerald-400/10 dark:text-emerald-400",
  },
};

interface AttendanceBadgeProps {
  type: AttendanceType;
}

export function AttendanceBadge({ type }: AttendanceBadgeProps) {
  const { label, icon: Icon, className } = config[type] ?? config.presential;

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${className}`}
    >
      <Icon className="size-3" />
      {label}
    </span>
  );
}
