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
    <Card
      variant="premium"
      className={href ? "rounded-3xl border border-[color:var(--premium-border)] transition-all hover:scale-[1.01] hover:bg-accent/20" : "rounded-3xl border border-[color:var(--premium-border)]"}
    >
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
          <span className="text-primary">{icon}</span>
          <span>{title}</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-2">
            <div className="h-8 w-20 animate-pulse rounded bg-accent/60" />
            <div className="h-4 w-36 animate-pulse rounded bg-accent/60" />
          </div>
        ) : (
          <>
            <p className="premium-heading text-2xl">{value}</p>
            <div className="mt-1 flex items-center justify-between gap-3">
              {description ? <p className="premium-subheading">{description}</p> : <span />}
              {href ? (
                <ArrowRight className="size-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
              ) : null}
            </div>
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
      {content}
    </Link>
  );
}
