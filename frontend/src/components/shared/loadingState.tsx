import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

type LoadingVariant = "page" | "card" | "table" | "list";

interface LoadingStateProps {
  variant?: LoadingVariant;
  className?: string;
}

function PageLoading({ className }: { className?: string }) {
  return (
    <div className={cn("space-y-6", className)}>
      <div className="space-y-2">
        <Skeleton className="h-8 w-48 bg-muted" />
        <Skeleton className="h-4 w-72 bg-muted" />
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-28 rounded-xl bg-muted" />
        ))}
      </div>
      <Skeleton className="h-64 rounded-xl bg-muted" />
    </div>
  );
}

function CardLoading({ className }: { className?: string }) {
  return (
    <div className={cn("space-y-3", className)}>
      <Skeleton className="h-5 w-32 bg-muted" />
      <Skeleton className="h-4 w-full bg-muted" />
      <Skeleton className="h-4 w-3/4 bg-muted" />
    </div>
  );
}

function TableLoading({ className }: { className?: string }) {
  return (
    <div className={cn("space-y-3", className)}>
      <Skeleton className="h-10 w-full rounded-lg bg-muted" />
      {Array.from({ length: 5 }).map((_, i) => (
        <Skeleton key={i} className="h-12 w-full rounded-lg bg-muted" />
      ))}
    </div>
  );
}

function ListLoading({ className }: { className?: string }) {
  return (
    <div className={cn("space-y-2", className)}>
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="flex items-center gap-3">
          <Skeleton className="size-10 rounded-full bg-muted" />
          <div className="flex-1 space-y-1.5">
            <Skeleton className="h-4 w-1/3 bg-muted" />
            <Skeleton className="h-3 w-1/2 bg-muted" />
          </div>
        </div>
      ))}
    </div>
  );
}

const variants: Record<LoadingVariant, React.ComponentType<{ className?: string }>> = {
  page: PageLoading,
  card: CardLoading,
  table: TableLoading,
  list: ListLoading,
};

export function LoadingState({ variant = "page", className }: LoadingStateProps) {
  const Component = variants[variant];
  return <Component className={className} />;
}
