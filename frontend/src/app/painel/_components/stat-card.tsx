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
      variant="glass"
      className={href ? "rounded-3xl transition-all hover:scale-[1.01] hover:bg-accent/20" : "rounded-3xl"}
    >
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center justify-between text-sm font-medium text-muted-foreground">
          {title}
          <span className="text-primary">{icon}</span>
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
            {description ? <p className="premium-subheading mt-1">{description}</p> : null}
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
          <ArrowRight className="pointer-events-none absolute right-4 top-4 size-4 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
        ) : null}
      </div>
    </Link>
  );
}
