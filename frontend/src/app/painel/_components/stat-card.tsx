import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface StatCardProps {
  title: string;
  value: string;
  description?: string;
  href?: string;
  icon: React.ReactNode;
  loading?: boolean;
}

export function StatCard({
  title,
  value,
  description,
  href,
  icon,
  loading = false,
}: StatCardProps) {
  const content = (
    <Card className={href ? "transition-colors hover:bg-gray-50" : undefined}>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center justify-between text-sm font-medium text-gray-500">
          {title}
          <span className="text-gray-400">{icon}</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-2">
            <div className="h-8 w-20 animate-pulse rounded bg-gray-100" />
            <div className="h-4 w-36 animate-pulse rounded bg-gray-100" />
          </div>
        ) : (
          <>
            <p className="text-2xl font-semibold text-gray-900">{value}</p>
            {description ? <p className="mt-1 text-sm text-gray-500">{description}</p> : null}
          </>
        )}
      </CardContent>
    </Card>
  );

  if (!href) {
    return content;
  }

  return (
    <Link href={href} className="group block">
      <div className="relative">
        {content}
        {!loading ? (
          <ArrowRight className="pointer-events-none absolute right-4 top-4 size-4 text-gray-300 transition-transform group-hover:translate-x-0.5" />
        ) : null}
      </div>
    </Link>
  );
}
